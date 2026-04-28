// services/hmp.service.js
'use strict';

const { dbmodal, sutramDB } = require('../database/db.model');
const db = dbmodal.db;
const BaseTable = require('../database/base.table');
const Fn = require('../database/functions');

// ── Table instances ───────────────────────────────────────────
const hmpRecipe = new BaseTable('hmp_recipe');
const hmpRecipeIn = new BaseTable('hmp_recipe_input');
const hmpRecipeOut = new BaseTable('hmp_recipe_output');
const hmpBatch = new BaseTable('hmp_batch');
const hmpBatchIn = new BaseTable('hmp_batch_input');
const hmpBatchOut = new BaseTable('hmp_batch_output');
const aawak = new BaseTable('aawak');
const subitemList = new BaseTable('subitem_list');
const jawak = new BaseTable('jawak');

// ─────────────────────────────────────────────────────────────
// ── RECIPE ────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────

// Returns all active recipes for a dept.
// schema.joins on hmp_recipe has inputs/outputs as hasMany →
// BaseTable auto-builds the nested subquery → no manual loop needed.
function getRecipesByDept(dept_id) {
    return hmpRecipe.getAll({ dept_id, active: 1 }, { orderBy: 'recipe_name ASC' });
}

// Upsert recipe + clean-replace all inputs/outputs in one transaction.
function insertUpdateRecipe(data) {
    try {
        sutramDB.begin();
        let recipeId;

        if (data._id || data.recipe_id) {
            recipeId = data._id || data.recipe_id;
            hmpRecipe.updateById(data, recipeId);
        } else {
            recipeId = hmpRecipe.insert(data, false);
        }

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

        sutramDB.commit();
        return recipeId;
    } catch (err) {
        sutramDB.rollback();
        throw err;
    }
}

function deleteRecipe(id) {
    try {
        sutramDB.begin();
        hmpRecipeIn.delete({ recipe_id: id });
        hmpRecipeOut.delete({ recipe_id: id });
        const res = hmpRecipe.deleteById(id);
        sutramDB.commit();
        return res;
    } catch (err) {
        sutramDB.rollback();
        throw err;
    }
}


function buildSubitemListMap(subitemLists) {
    return Object.fromEntries(subitemLists.map(sl => [sl._id, sl]));
}


function injectSubitemList(entries, subitemListMap) {
    for (const entry of entries) {
        if (entry.subitem?.subitem_list_id) {
            entry.subitem.subitem_list = subitemListMap[entry.subitem.subitem_list_id] ?? null;
        }
    }
}

// ─────────────────────────────────────────────────────────────
// ── BATCH LIST ────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────

// Paginated, filtered batch list.
// Uses BaseTable.getAll() with a raw WHERE string — schema-driven joins
// auto-build recipe + mm (hasOne) and inputs/outputs (hasMany) from schema.

function getBatches({ dept_id, mm_id, recipe_id, item_id, date_from, date_to, year, pageNo }) {
    const PAGE_SIZE = 100;
    const page = (pageNo && pageNo > 0) ? Number(pageNo) : 1;
    const offset = (page - 1) * PAGE_SIZE;

    // ── build WHERE ───────────────────────────────────────────
    const conds = [
        `hmp_batch.dept_id = ${Number(dept_id)}`,
        `hmp_batch.active = 1`,
    ];

    if (mm_id) conds.push(`hmp_batch.mm_id = ${Number(mm_id)}`);
    if (recipe_id) conds.push(`hmp_batch.recipe_id = ${Number(recipe_id)}`);
    if (year) conds.push(`strftime('%Y', hmp_batch.date) = '${String(year)}'`);

    if (date_from && date_to) {
        conds.push(`hmp_batch.date BETWEEN '${date_from}' AND '${date_to}'`);
    } else if (date_from) {
        conds.push(`hmp_batch.date >= '${date_from}'`);
    } else if (date_to) {
        conds.push(`hmp_batch.date <= '${date_to}'`);
    }

    if (item_id) {
        conds.push(`hmp_batch._id IN (
            SELECT batch_id FROM hmp_batch_input  WHERE item_id = ${Number(item_id)} AND active = 1
            UNION
            SELECT batch_id FROM hmp_batch_output WHERE item_id = ${Number(item_id)} AND active = 1
        )`);
    }

    const where = conds.join(' AND ');

    // ── count (plain — no joins needed) ──────────────────────
    const total_count = db.prepare(
        `SELECT COUNT(*) AS cnt FROM hmp_batch WHERE ${where}`
    ).get().cnt;

    // ── data — BaseTable auto-builds all joins from schema ────
    // hmp_batch schema has:
    //   hasOne  → recipe, mm, dept  (via column ref)
    //   hasMany → inputs, outputs   (via joins{})
    //             └─ each child auto-includes its own hasOne: item, subitem, unit, condition
    const result = hmpBatch.getAll(where, {
        orderBy: 'hmp_batch.date DESC',
        limit: PAGE_SIZE,
        offset,
    });

    const subitemListMap = buildSubitemListMap(subitemList.getAll());

    for (const batch of result) {
        injectSubitemList(batch.inputs || [], subitemListMap);
        injectSubitemList(batch.outputs || [], subitemListMap);
        if (batch.outputs && batch.outputs.length > 0) {
            for (const out of batch.outputs) {
                if (out.aawak_ref_id) {
                    const aawak_detail = aawak.getById(out.aawak_ref_id);
                    out.aawak_detail = aawak_detail;
                    // if (aawak) {
                    //     aawak.jawak_detail = jawak.getAll({ aawak_ref_id: out.aawak_ref_id });
                    //     out.aawak_detail = aawak;
                    //     out.jawak_detail = aawak.jawak_detail;
                    // } else {
                    //     out.jawak_detail = [];
                    // }
                } else {
                    out.aawak_detail = null;
                }
            }
        }
    }

    return { result, pageNo: page, total_count };
}


// ─────────────────────────────────────────────────────────────
// ── BATCH INSERT / UPDATE ─────────────────────────────────────
// ─────────────────────────────────────────────────────────────

async function insertUpdateBatch(data) {
    try {
        sutramDB.begin();
        let batchId;

        let id;
        if (data._id) {
            hmpBatch.updateById(data, data._id);
            id = Number(data._id);
        } else {
            id = hmpBatch.insert(data, false);
        }

        for (const inp of data.inputs ?? []) {
            if (!inp.item_id || !inp.qty) continue;
            inp.batch_id = id;

            // Handle Jawak Auto-creation (Global flag)
            if (data.auto_jawak) {
                let jwk = Fn.tbInterface.getJawakFromHmpInput(data, inp);
                jwk.aawak_source_id = inp.aawak_source_id || null;

                if (inp.jawak_ref_id) {
                    jwk._id = inp.jawak_ref_id;
                    await Fn.updateAJ(jwk, 'jawak');
                } else {
                    let jawakRefId = await Fn.insertAJ(jwk, 'jawak');
                    inp.jawak_ref_id = jawakRefId;
                }
            }

            if (inp._id) {
                hmpBatchIn.updateById(inp, inp._id);
            } else {
                hmpBatchIn.insert(inp, false);
            }
        }

        for (const out of data.outputs ?? []) {
            if (!out.item_id || !out.qty) continue;
            out.batch_id = id;

            let hasJawaks = out.jawak_detail && out.jawak_detail.length > 0;

            // Handle Aawak Auto-creation (Global flag or Jawak existence)
            if (data.auto_aawak || hasJawaks) {
                let awk = Fn.tbInterface.getAawakFromHmpOutput(data, out);

                if (out.aawak_ref_id) {
                    awk._id = out.aawak_ref_id;
                    await Fn.updateAJ(awk, 'aawak');
                } else {
                    let aawakRefId = await Fn.insertAJ(awk, 'aawak');
                    out.aawak_ref_id = aawakRefId;
                }
            }

            if (hasJawaks) {
                for (let jwk of out.jawak_detail) {
                    jwk.aawak_ref_id = out.aawak_ref_id;

                    if (jwk._id) {
                        await Fn.updateAJ(jwk, 'jawak');
                    } else {
                        await Fn.insertAJ(jwk, 'jawak');
                    }
                }
            }

            if (out._id) {
                hmpBatchOut.updateById(out, out._id);
            } else {
                hmpBatchOut.insert(out, false);
            }
        }

        batchId = id;
        sutramDB.commit();

        // getById uses schema joins — returns full nested object automatically
        return hmpBatch.getById(batchId);
    } catch (err) {
        sutramDB.rollback();
        throw err;
    }
}


// ─────────────────────────────────────────────────────────────
// ── BATCH DELETE ──────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────

async function deleteBatch(id) {
    try {
        sutramDB.begin();
        const inputs = hmpBatchIn.getAll({ batch_id: id }, { full: false });
        for (const inp of inputs) {
            if (inp.jawak_ref_id) await Fn.deleteAJ(inp.jawak_ref_id, 'jawak');
            hmpBatchIn.deleteById(inp._id);
        }

        const outputs = hmpBatchOut.getAll({ batch_id: id }, { full: false });
        for (const out of outputs) {
            if (out.aawak_ref_id) await Fn.deleteAJ(out.aawak_ref_id, 'aawak');
            hmpBatchOut.deleteById(out._id);
        }

        hmpBatch.deleteById(id);
        sutramDB.commit();
        return 1;
    } catch (err) {
        sutramDB.rollback();
        throw err;
    }
}

async function deleteBatchInput(id) {
    try {
        sutramDB.begin();
        const inp = hmpBatchIn.getOne({ _id: id }, { full: false });
        if (!inp) {
            sutramDB.commit();
            return 0;
        }
        if (inp.jawak_ref_id) {
            await Fn.deleteAJ(inp.jawak_ref_id, 'jawak');
        }
        hmpBatchIn.deleteById(id);
        sutramDB.commit();
        return 1;
    } catch (err) {
        sutramDB.rollback();
        throw err;
    }
}

async function deleteBatchOutput(id) {
    try {
        sutramDB.begin();
        const out = hmpBatchOut.getOne({ _id: id }, { full: false });
        if (!out) {
            sutramDB.commit();
            return 0;
        }
        if (out.aawak_ref_id) {
            await Fn.deleteAJ(out.aawak_ref_id, 'aawak');
        }
        hmpBatchOut.deleteById(id);
        sutramDB.commit();
        return 1;
    } catch (err) {
        sutramDB.rollback();
        throw err;
    }
}


// Centralized reference transfer
async function transferReferences(list_type, from_id, to_id, dept_id) {
    const fromIdNum = Number(from_id);
    const toIdNum = Number(to_id);

    // Find all batches that use this reference
    let condString = "";
    switch (list_type) {
        case 'mm': condString = `mm_id = ${fromIdNum}`; break;
        case 'item': condString = `hmp_batch._id IN (SELECT batch_id FROM hmp_batch_input WHERE item_id = ${fromIdNum} UNION SELECT batch_id FROM hmp_batch_output WHERE item_id = ${fromIdNum})`; break;
        case 'subitem': condString = `hmp_batch._id IN (SELECT batch_id FROM hmp_batch_input WHERE subitem_id = ${fromIdNum} UNION SELECT batch_id FROM hmp_batch_output WHERE subitem_id = ${fromIdNum})`; break;
        case 'unit': condString = `hmp_batch._id IN (SELECT batch_id FROM hmp_batch_input WHERE unit_id = ${fromIdNum} UNION SELECT batch_id FROM hmp_batch_output WHERE unit_id = ${fromIdNum})`; break;
    }

    if (!condString) return;

    const batches = hmpBatch.getAll(`hmp_batch.dept_id = ${Number(dept_id)} AND hmp_batch.active = 1 AND ${condString}`);

    for (const batch of batches) {
        if (list_type === 'mm') {
            batch.mm_id = toIdNum;
        }

        // Update inputs/outputs
        if (batch.inputs) {
            batch.inputs.forEach(inp => {
                if (list_type === 'item' && Number(inp.item_id) === fromIdNum) inp.item_id = toIdNum;
                if (list_type === 'subitem' && Number(inp.subitem_id) === fromIdNum) inp.subitem_id = toIdNum;
                if (list_type === 'unit' && Number(inp.unit_id) === fromIdNum) inp.unit_id = toIdNum;
            });
        }
        if (batch.outputs) {
            batch.outputs.forEach(out => {
                if (list_type === 'item' && Number(out.item_id) === fromIdNum) out.item_id = toIdNum;
                if (list_type === 'subitem' && Number(out.subitem_id) === fromIdNum) out.subitem_id = toIdNum;
                if (list_type === 'unit' && Number(out.unit_id) === fromIdNum) out.unit_id = toIdNum;
            });
        }
        await insertUpdateBatch(batch);
    }
}

// ─────────────────────────────────────────────────────────────
module.exports = {
    // subitem list
    buildSubitemListMap,
    injectSubitemList,
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
    transferReferences,
};