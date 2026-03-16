// services/hmp.service.js
'use strict';

const { dbmodal } = require('../database/db.model');
const db = dbmodal.db;
const BaseTable = require('../database/base.table');

// ── Table instances ───────────────────────────────────────────
const hmpRecipe = new BaseTable('hmp_recipe');
const hmpRecipeIn = new BaseTable('hmp_recipe_input');
const hmpRecipeOut = new BaseTable('hmp_recipe_output');
const hmpBatch = new BaseTable('hmp_batch');
const hmpBatchIn = new BaseTable('hmp_batch_input');
const hmpBatchOut = new BaseTable('hmp_batch_output');

// ── Prepared statements (cached once at module load) ──────────
// Full batch row with all joins — used by getById + insertUpdate return
const BATCH_FULL_SQL = `
    SELECT
        b._id, b.recipe_id, b.batch_no, b.date, b.mm_id, b.status,
        b.notes, b.dept_id, b.active,
        b.created_at, b.updated_at,

        -- recipe
        json_object(
            '_id',         r._id,
            'recipe_name', r.recipe_name,
            'recipe_code', r.recipe_code,
            'description', r.description
        ) AS recipe,

        -- mm
        json_object(
            '_id',    m._id,
            'mm_hin', m.mm_hin,
            'mm_eng', m.mm_eng
        ) AS mm,

        -- inputs
        CASE WHEN COUNT(bi._id) = 0
            THEN json('[]')
            ELSE json_group_array(DISTINCT json_object(
                '_id',         bi._id,
                'batch_id',    bi.batch_id,
                'item_id',     bi.item_id,
                'subitem_id',  bi.subitem_id,
                'unit_id',     bi.unit_id,
                'condition_id',bi.condition_id,
                'qty',         bi.qty,
                'rate',        bi.rate,
                'amount',      bi.amount,
                'lot_no',      bi.lot_no,
                'jawak_ref_id',bi.jawak_ref_id,
                'active',      bi.active,
                'item',        json_object('_id', ii._id, 'item_hin', ii.item_hin, 'item_eng', ii.item_eng, 'item_roman', ii.item_roman),
                'subitem',     CASE WHEN bi.subitem_id IS NULL THEN NULL ELSE json_object('_id', si._id, 'subitem_list_id', si.subitem_list_id, 'subitem_hin', sl.subitem_hin, 'subitem_eng', sl.subitem_eng) END,
                'unit',        json_object('_id', ui._id, 'unit_short', ui.unit_short, 'unit_full', ui.unit_full),
                'condition',   CASE WHEN bi.condition_id IS NULL THEN NULL ELSE json_object('_id', ci._id, 'list_name_hin', ci.list_name_hin, 'list_name_eng', ci.list_name_eng) END
            ))
        END AS inputs,

        -- outputs
        CASE WHEN COUNT(bo._id) = 0
            THEN json('[]')
            ELSE json_group_array(DISTINCT json_object(
                '_id',          bo._id,
                'batch_id',     bo.batch_id,
                'item_id',      bo.item_id,
                'subitem_id',   bo.subitem_id,
                'unit_id',      bo.unit_id,
                'condition_id', bo.condition_id,
                'qty',          bo.qty,
                'rate',         bo.rate,
                'amount',       bo.amount,
                'lot_no',       bo.lot_no,
                'hmp_code',     bo.hmp_code,
                'hmp_type',     bo.hmp_type,
                'aawak_ref_id', bo.aawak_ref_id,
                'active',       bo.active,
                'item',        json_object('_id', io._id, 'item_hin', io.item_hin, 'item_eng', io.item_eng, 'item_roman', io.item_roman),
                'subitem',     CASE WHEN bo.subitem_id IS NULL THEN NULL ELSE json_object('_id', so._id, 'subitem_list_id', so.subitem_list_id, 'subitem_hin', slo.subitem_hin, 'subitem_eng', slo.subitem_eng) END,
                'unit',        json_object('_id', uo._id, 'unit_short', uo.unit_short, 'unit_full', uo.unit_full),
                'condition',   CASE WHEN bo.condition_id IS NULL THEN NULL ELSE json_object('_id', co._id, 'list_name_hin', co.list_name_hin, 'list_name_eng', co.list_name_eng) END
            ))
        END AS outputs

    FROM hmp_batch b
    LEFT JOIN hmp_recipe r  ON r._id = b.recipe_id
    LEFT JOIN mm m          ON m._id = b.mm_id

    -- inputs joins
    LEFT JOIN hmp_batch_input  bi  ON bi.batch_id = b._id AND bi.active = 1
    LEFT JOIN item             ii  ON ii._id = bi.item_id
    LEFT JOIN subitem          si  ON si._id = bi.subitem_id
    LEFT JOIN subitem_list     sl  ON sl._id = si.subitem_list_id
    LEFT JOIN unit             ui  ON ui._id = bi.unit_id
    LEFT JOIN support_list     ci  ON ci._id = bi.condition_id

    -- outputs joins
    LEFT JOIN hmp_batch_output bo  ON bo.batch_id = b._id AND bo.active = 1
    LEFT JOIN item             io  ON io._id = bo.item_id
    LEFT JOIN subitem          so  ON so._id = bo.subitem_id
    LEFT JOIN subitem_list     slo ON slo._id = so.subitem_list_id
    LEFT JOIN unit             uo  ON uo._id = bo.unit_id
    LEFT JOIN support_list     co  ON co._id = bo.condition_id
`;

// parse json string columns on a batch row
function _parseBatch(row) {
    if (!row) return null;
    if (typeof row.recipe === 'string') row.recipe = JSON.parse(row.recipe);
    if (typeof row.mm === 'string') row.mm = JSON.parse(row.mm);
    if (typeof row.inputs === 'string') row.inputs = JSON.parse(row.inputs) ?? [];
    if (typeof row.outputs === 'string') row.outputs = JSON.parse(row.outputs) ?? [];
    return row;
}

// ─────────────────────────────────────────────────────────────
// ── RECIPE ────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────

function getRecipesByDept(dept_id) {
    // console.log(hmpRecipe._buildQuery('hmp_recipe'));

    const recipes = hmpRecipe.getAll({ dept_id, active: 1 }, { orderBy: 'recipe_name ASC' });
    for (const r of recipes) {
        r.inputs = hmpRecipeIn.getAll({ recipe_id: r._id });
        r.outputs = hmpRecipeOut.getAll({ recipe_id: r._id });
    }
    return recipes;
}

function insertUpdateRecipe(data) {
    return BaseTable.transaction(() => {
        let recipeId;

        if (data._id || data.recipe_id) {
            // update
            recipeId = data._id || data.recipe_id;
            hmpRecipe.updateById(data, recipeId);
        } else {
            // insert
            recipeId = hmpRecipe.insert(data, false);
        }

        // replace inputs/outputs — delete old, insert new
        hmpRecipeIn.delete({ recipe_id: recipeId });
        hmpRecipeOut.delete({ recipe_id: recipeId });

        for (const inp of data.inputs ?? []) {
            if (!inp.item_id || !inp.qty) continue;
            hmpRecipeIn.insert({ ...inp, recipe_id: recipeId }, false);
        }
        for (const out of data.outputs ?? []) {
            if (!out.item_id || !out.qty) continue;
            hmpRecipeOut.insert({ ...out, recipe_id: recipeId }, false);
        }

        return recipeId;
    });
}

function deleteRecipe(id) {
    return BaseTable.transaction(() => {
        hmpRecipeIn.delete({ recipe_id: id });
        hmpRecipeOut.delete({ recipe_id: id });
        return hmpRecipe.deleteById(id);
    });
}

// ─────────────────────────────────────────────────────────────
// ── BATCH LIST (replaces Sequelize findAndCountAll) ───────────
// ─────────────────────────────────────────────────────────────

function getBatches({ dept_id, mm_id, recipe_id, item_id, date_from, date_to, year, pageNo }) {
    const PAGE_SIZE = 100;
    const page = (pageNo && pageNo > 0) ? Number(pageNo) : 1;
    const offset = (page - 1) * PAGE_SIZE;

    // ── build WHERE clause ────────────────────────────────────
    const conditions = [`b.dept_id = ${Number(dept_id)}`, `b.active = 1`];

    if (mm_id) conditions.push(`b.mm_id = ${Number(mm_id)}`);
    if (recipe_id) conditions.push(`b.recipe_id = ${Number(recipe_id)}`);
    if (year) conditions.push(`strftime('%Y', b.date) = '${String(year)}'`);

    if (date_from && date_to) {
        conditions.push(`b.date BETWEEN '${date_from}' AND '${date_to}'`);
    } else if (date_from) {
        conditions.push(`b.date >= '${date_from}'`);
    } else if (date_to) {
        conditions.push(`b.date <= '${date_to}'`);
    }

    // item filter — batch must have this item in inputs OR outputs
    if (item_id) {
        conditions.push(`b._id IN (
            SELECT batch_id FROM hmp_batch_input  WHERE item_id = ${Number(item_id)} AND active = 1
            UNION
            SELECT batch_id FROM hmp_batch_output WHERE item_id = ${Number(item_id)} AND active = 1
        )`);
    }

    const WHERE = `WHERE ${conditions.join(' AND ')}`;

    // ── count ─────────────────────────────────────────────────
    const total_count = db.prepare(
        `SELECT COUNT(DISTINCT b._id) AS cnt FROM hmp_batch b ${WHERE}`
    ).get().cnt;

    // ── data ──────────────────────────────────────────────────
    const rows = db.prepare(`
        ${BATCH_FULL_SQL}
        ${WHERE}
        GROUP BY b._id
        ORDER BY b.date DESC, b._id DESC
        LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `).all();

    return {
        result: rows.map(_parseBatch),
        pageNo: page,
        total_count,
    };
}

// ─────────────────────────────────────────────────────────────
// ── BATCH INSERT / UPDATE ─────────────────────────────────────
// ─────────────────────────────────────────────────────────────

function insertUpdateBatch(data) {
    const batchId = BaseTable.transaction(() => {
        let id;

        if (data._id) {
            hmpBatch.updateById(data, data._id);
            id = Number(data._id);
        } else {
            id = hmpBatch.insert(data, false);
        }

        // ── inputs ────────────────────────────────────────────
        for (const inp of data.inputs ?? []) {
            if (!inp.item_id || !inp.qty) continue;
            inp.batch_id = id;

            if (inp._id) {
                hmpBatchIn.updateById(inp, inp._id);
            } else {
                hmpBatchIn.insert(inp, false);
            }
        }

        // ── outputs ───────────────────────────────────────────
        for (const out of data.outputs ?? []) {
            if (!out.item_id || !out.qty) continue;
            out.batch_id = id;

            if (out._id) {
                hmpBatchOut.updateById(out, out._id);
            } else {
                hmpBatchOut.insert(out, false);
            }
        }

        return id;
    });

    // return full joined object — same shape as old Sequelize response
    return _getBatchById(batchId);
}

// ─────────────────────────────────────────────────────────────
// ── BATCH DELETE ──────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────

function deleteBatch(id) {
    return BaseTable.transaction(() => {
        // soft delete inputs/outputs first so FK is clean
        // hard delete is fine too since no cascade needed from our side
        hmpBatchIn.delete({ batch_id: id });
        hmpBatchOut.delete({ batch_id: id });
        return hmpBatch.deleteById(id);
    });
}

function deleteBatchInput(id) {
    return BaseTable.transaction(() => {
        const inp = hmpBatchIn.getById(id);
        if (!inp) return 0;

        // TODO: if inp.auto_jawak && inp.jawak_ref_id → delete jawak via aj.service
        // aj.deleteJawak(inp.jawak_ref_id);

        return hmpBatchIn.deleteById(id);
    });
}

function deleteBatchOutput(id) {
    return BaseTable.transaction(() => {
        const out = hmpBatchOut.getById(id);
        if (!out) return 0;

        // TODO: if out.auto_aawak && out.aawak_ref_id → delete aawak via aj.service
        // aj.deleteAawak(out.aawak_ref_id);

        return hmpBatchOut.deleteById(id);
    });
}

// ─────────────────────────────────────────────────────────────
// ── INTERNAL HELPERS ──────────────────────────────────────────
// ─────────────────────────────────────────────────────────────

function _getBatchById(id) {
    const row = db.prepare(`
        ${BATCH_FULL_SQL}
        WHERE b._id = ${Number(id)}
        GROUP BY b._id
    `).get();
    return _parseBatch(row);
}

// ─────────────────────────────────────────────────────────────
module.exports = {
    // recipe
    getRecipesByDept,
    insertUpdateRecipe,
    deleteRecipe,
    // batch
    getBatches,
    insertUpdateBatch,
    deleteBatch,
    deleteBatchInput,
    deleteBatchOutput,
};