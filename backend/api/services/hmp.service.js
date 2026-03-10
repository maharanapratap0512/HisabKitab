// services/hmp.service.js
const db = require('../db/connection');
const BaseTable = require('../database/base.table');
// const jawak = require('./jawak.service');
// const aawak = require('./aawak.service');

// ── Simple table instances — no separate files needed ──
const hmpRecipe = new BaseTable('hmp_recipe');
const hmpRecipeIn = new BaseTable('hmp_recipe_input');
const hmpRecipeOut = new BaseTable('hmp_recipe_output');
const hmpBatch = new BaseTable('hmp_batch');
const hmpBatchIn = new BaseTable('hmp_batch_input');
const hmpBatchOut = new BaseTable('hmp_batch_output');

class HmpService {

    // ── Recipe ────────────────────────────────────────────────

    async insertUpdateRecipe(data) {
        // frontend may send recipe_id instead of _id
        if (data.recipe_id && !data._id) data._id = data.recipe_id;

        let recipeId;
        if (data._id) {
            const [sql, params] = hmpRecipe.buildUpdate(data, [{ col: '_id', val: data._id }]);
            db.prepare(sql).run(...params);
            recipeId = data._id;
        } else {
            const [sql, params] = hmpRecipe.buildInsert(data);
            recipeId = db.prepare(sql).run(...params).lastInsertRowid;
        }

        // clean replace inputs/outputs
        db.prepare(`DELETE FROM hmp_recipe_input  WHERE recipe_id = ?`).run(recipeId);
        db.prepare(`DELETE FROM hmp_recipe_output WHERE recipe_id = ?`).run(recipeId);

        if (Array.isArray(data.inputs)) {
            for (const input of data.inputs) {
                input.recipe_id = recipeId;
                const [sql, params] = hmpRecipeIn.buildInsert(input);
                db.prepare(sql).run(...params);
            }
        }

        if (Array.isArray(data.outputs)) {
            for (const output of data.outputs) {
                output.recipe_id = recipeId;
                const [sql, params] = hmpRecipeOut.buildInsert(output);
                db.prepare(sql).run(...params);
            }
        }

        return recipeId;
    }

    async deleteRecipe(id) {
        db.prepare(`DELETE FROM hmp_recipe_input  WHERE recipe_id = ?`).run(id);
        db.prepare(`DELETE FROM hmp_recipe_output WHERE recipe_id = ?`).run(id);
        return db.prepare(`DELETE FROM hmp_recipe WHERE _id = ?`).run(id).changes;
    }

    // ── Batch ─────────────────────────────────────────────────

    async insertUpdateBatch(data) {
        // lazy require to avoid circular dependency
        const AJ = require('./aj.service');
        const Jawak = require('../db-layer/tables/jawak');
        const Aawak = require('../db-layer/tables/aawak');
        const jawak = new Jawak();
        const aawak = new Aawak();

        // upsert batch
        let batchId;
        if (data._id) {
            const [sql, params] = hmpBatch.buildUpdate(data, [{ col: '_id', val: data._id }]);
            db.prepare(sql).run(...params);
            batchId = data._id;
        } else {
            const [sql, params] = hmpBatch.buildInsert(data);
            batchId = db.prepare(sql).run(...params).lastInsertRowid;
        }

        // ── Process Inputs ──
        if (Array.isArray(data.inputs)) {
            const jawakVoucherNo = this._getLastVoucherNo('jawak') + 1;

            for (const input of data.inputs) {
                if (!input.item_id || !input.qty) continue;

                // auto_jawak flag — create real jawak entry only if true
                if (input.auto_jawak) {
                    const jwkData = jawak.fromHmpInput(data, input);
                    jwkData.voucher_no = jawakVoucherNo;

                    if (input.jawak_ref_id) {
                        await AJ.updateAJ({ ...jwkData, _id: input.jawak_ref_id }, 'jawak');
                    } else {
                        input.jawak_ref_id = await AJ.insertAJ(jwkData, 'jawak');
                    }
                }

                // upsert batch input row
                input.batch_id = batchId;
                input.active = 1;
                if (input._id) {
                    const [sql, params] = hmpBatchIn.buildUpdate(input, [{ col: '_id', val: input._id }]);
                    db.prepare(sql).run(...params);
                } else {
                    const [sql, params] = hmpBatchIn.buildInsert(input);
                    db.prepare(sql).run(...params);
                }
            }
        }

        // ── Process Outputs ──
        if (Array.isArray(data.outputs)) {
            const aawakVoucherNo = this._getLastVoucherNo('aawak') + 1;

            for (const output of data.outputs) {
                if (!output.item_id || !output.qty) continue;

                // auto_aawak flag — create real aawak entry only if true
                if (output.auto_aawak) {
                    const awkData = aawak.fromHmpOutput(data, output);
                    awkData.voucher_no = aawakVoucherNo;

                    if (output.aawak_ref_id) {
                        await AJ.updateAJ({ ...awkData, _id: output.aawak_ref_id }, 'aawak');
                    } else {
                        output.aawak_ref_id = await AJ.insertAJ(awkData, 'aawak');
                    }
                }

                // upsert batch output row
                output.batch_id = batchId;
                output.active = 1;
                if (output._id) {
                    const [sql, params] = hmpBatchOut.buildUpdate(output, [{ col: '_id', val: output._id }]);
                    db.prepare(sql).run(...params);
                } else {
                    const [sql, params] = hmpBatchOut.buildInsert(output);
                    db.prepare(sql).run(...params);
                }
            }
        }

        return batchId;
    }

    async deleteBatch(id) {
        const inputs = db.prepare(`SELECT * FROM hmp_batch_input  WHERE batch_id = ?`).all(id);
        const outputs = db.prepare(`SELECT * FROM hmp_batch_output WHERE batch_id = ?`).all(id);

        for (const input of inputs) await this.deleteBatchInput(input._id);
        for (const output of outputs) await this.deleteBatchOutput(output._id);

        return db.prepare(`DELETE FROM hmp_batch WHERE _id = ?`).run(id).changes;
    }

    async deleteBatchInput(id) {
        const input = db.prepare(`SELECT * FROM hmp_batch_input WHERE _id = ?`).get(id);
        if (!input) return 0;

        // delete linked jawak if was auto created
        if (input.jawak_ref_id && input.auto_jawak) {
            const AJ = require('./aj.service');
            await AJ.deleteAJ(input.jawak_ref_id, 'jawak');
        }

        return db.prepare(`DELETE FROM hmp_batch_input WHERE _id = ?`).run(id).changes;
    }

    async deleteBatchOutput(id) {
        const output = db.prepare(`SELECT * FROM hmp_batch_output WHERE _id = ?`).get(id);
        if (!output) return 0;

        // delete linked aawak if was auto created
        if (output.aawak_ref_id && output.auto_aawak) {
            const AJ = require('./aj.service');
            await AJ.deleteAJ(output.aawak_ref_id, 'aawak');
        }

        return db.prepare(`DELETE FROM hmp_batch_output WHERE _id = ?`).run(id).changes;
    }

    // ── Private Helpers ───────────────────────────────────────

    _getLastVoucherNo(table) {
        const row = db.prepare(`SELECT MAX(voucher_no) as v_no FROM ${table}`).get();
        return row?.v_no || 0;
    }

    _getBatchById(id) {
        const batch = db.prepare(`
      SELECT b.*,
        r.recipe_name, r.recipe_code,
        m.mm_hin, m.mm_eng, m.mm_code,
        json_group_array(DISTINCT json_object(
          '_id',         bi._id,
          'item_id',     bi.item_id,
          'item_hin',    ii.item_hin,
          'item_eng',    ii.item_eng,
          'subitem_id',  bi.subitem_id,
          'subitem_hin', si.subitem_hin,
          'unit_id',     bi.unit_id,
          'unit_short',  ui.unit_short,
          'qty',         bi.qty,
          'rate',        bi.rate,
          'lot_no',      bi.lot_no,
          'jawak_ref_id',bi.jawak_ref_id,
          'auto_jawak',  bi.auto_jawak
        )) as inputs,
        json_group_array(DISTINCT json_object(
          '_id',         bo._id,
          'item_id',     bo.item_id,
          'item_hin',    io.item_hin,
          'item_eng',    io.item_eng,
          'subitem_id',  bo.subitem_id,
          'subitem_hin', so.subitem_hin,
          'unit_id',     bo.unit_id,
          'unit_short',  uo.unit_short,
          'qty',         bo.qty,
          'rate',        bo.rate,
          'aawak_ref_id',bo.aawak_ref_id,
          'auto_aawak',  bo.auto_aawak
        )) as outputs
      FROM hmp_batch b
      LEFT JOIN hmp_recipe       r  ON r._id  = b.recipe_id
      LEFT JOIN mm               m  ON m._id  = b.mm_id
      LEFT JOIN hmp_batch_input  bi ON bi.batch_id = b._id AND bi.active = 1
      LEFT JOIN hmp_batch_output bo ON bo.batch_id = b._id AND bo.active = 1
      LEFT JOIN item    ii ON ii._id = bi.item_id
      LEFT JOIN item    io ON io._id = bo.item_id
      LEFT JOIN subitem si ON si._id = bi.subitem_id
      LEFT JOIN subitem so ON so._id = bo.subitem_id
      LEFT JOIN unit    ui ON ui._id = bi.unit_id
      LEFT JOIN unit    uo ON uo._id = bo.unit_id
      WHERE b._id = ?
      GROUP BY b._id
    `).get(id);

        if (!batch) return null;
        return {
            ...batch,
            inputs: JSON.parse(batch.inputs || '[]'),
            outputs: JSON.parse(batch.outputs || '[]'),
        };
    }

}

module.exports = new HmpService();