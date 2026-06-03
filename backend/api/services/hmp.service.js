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

function getBatches({ dept_id, mm_id, recipe_id, item_id, date, date_from, date_to, year, pageNo, all = false, batchIds = [] }) {
    const PAGE_SIZE = 100;
    const page = (pageNo && pageNo > 0) ? Number(pageNo) : 1;
    const offset = (page - 1) * PAGE_SIZE;

    // ── build WHERE ───────────────────────────────────────────
    const conds = [
        `hmp_batch.dept_id = ${Number(dept_id)}`,
        `hmp_batch.active = 1`,
    ];

    if (batchIds && batchIds.length > 0) {
        conds.push(`hmp_batch._id IN (${batchIds.map(id => Number(id)).join(',')})`);
    }

    if (mm_id) conds.push(`hmp_batch.mm_id = ${Number(mm_id)}`);
    if (recipe_id) conds.push(`hmp_batch.recipe_id = ${Number(recipe_id)}`);
    if (year) conds.push(`strftime('%Y', hmp_batch.date) = '${String(year)}'`);
    if (date) conds.push(`hmp_batch.date = '${date}'`);

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
        limit: all ? null : PAGE_SIZE,
        offset: all ? null : offset,
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
        const isNewBatch = !data._id;
        if (data._id) {
            hmpBatch.updateById(data, data._id);
            id = Number(data._id);
        } else {
            id = hmpBatch.insert(data, false);
        }

        for (const inp of data.inputs ?? []) {
            if (!inp.item_id || !inp.qty) continue;
            inp.batch_id = id;
            if (isNewBatch) {
                delete inp._id;
                delete inp.jawak_ref_id;
                if (inp.auto_aawak) delete inp.aawak_ref_id;
            }

            // Map frontend checkbox values to database columns
            inp.is_auto_jwk = (data.auto_jawak || inp.auto_jawak) ? 1 : 0;
            inp.is_auto_awk = (inp.auto_aawak) ? 1 : 0;

            // Handle Jawak Auto-creation (Global flag or row-level)
            if (data.auto_jawak || inp.auto_jawak) {
                // If auto_aawak is checked, create/update Aawak first
                if (inp.auto_aawak) {
                    let awk = {
                        ...Fn.tbInterface.aawak,
                        date: data.date,
                        mm_id: data.mm_id,
                        item_id: inp.item_id,
                        subitem_id: inp.subitem_id,
                        unit_id: inp.unit_id,
                        condition_id: inp.condition_id,
                        qty: inp.qty,
                        rate: inp.rate,
                        actual_amt: inp.qty * (inp.rate || 0),
                        aawak_type_id: inp.aawak_type_id || 50,
                        aawak_source_id: inp.aawak_source_id || null,
                        dept_id: data.dept_id,
                        description: `HMP Batch Input Auto-Aawak (Batch ID: ${id || ''}${data.batch_no ? ', Batch No: ' + data.batch_no : ''})`,
                        active: 1
                    };

                    let awkExists = inp.aawak_ref_id ? await Fn.getById('aawak', inp.aawak_ref_id) : null;
                    if (inp.aawak_ref_id && awkExists) {
                        awk._id = inp.aawak_ref_id;
                        await Fn.updateAJ(awk, 'aawak');
                    } else {
                        let aawakRefId = await Fn.insertAJ(awk, 'aawak');
                        inp.aawak_ref_id = aawakRefId;
                    }
                }

                let jwk = Fn.tbInterface.getJawakFromHmpInput(data, inp);
                jwk.aawak_source_id = inp.aawak_source_id || null;
                jwk.aawak_ref_id = inp.aawak_ref_id || null;

                let jwkExists = inp.jawak_ref_id ? await Fn.getById('jawak', inp.jawak_ref_id) : null;
                if (inp.jawak_ref_id && jwkExists) {
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
            if (isNewBatch) {
                delete out._id;
                delete out.aawak_ref_id;
            }

            let hasJawaks = out.jawak_detail && out.jawak_detail.length > 0;
            
            // Map frontend checkbox values to database columns
            out.is_auto_awk = (data.auto_aawak || out.auto_aawak || hasJawaks) ? 1 : 0;

            // Handle Aawak Auto-creation (Global flag or row-level or Jawak existence)
            if (data.auto_aawak || out.auto_aawak || hasJawaks) {
                let awk = Fn.tbInterface.getAawakFromHmpOutput(data, out);

                let awkExists = out.aawak_ref_id ? await Fn.getById('aawak', out.aawak_ref_id) : null;
                if (out.aawak_ref_id && awkExists) {
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
                    if (isNewBatch) {
                        delete jwk._id;
                    }

                    let jwkExists = jwk._id ? await Fn.getById('jawak', jwk._id) : null;
                    if (jwk._id && jwkExists) {
                        await Fn.updateAJ(jwk, 'jawak');
                    } else {
                        delete jwk._id;
                        let jwkid = await Fn.insertAJ(jwk, 'jawak');
                        jwk._id = jwkid;
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
            hmpBatchIn.deleteById(inp._id);
            if (inp.jawak_ref_id) await Fn.deleteAJ(inp.jawak_ref_id, 'jawak');
        }

        const outputs = hmpBatchOut.getAll({ batch_id: id }, { full: false });
        for (const out of outputs) {
            hmpBatchOut.deleteById(out._id);
            if (out.aawak_ref_id) await Fn.deleteAJ(out.aawak_ref_id, 'aawak');
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
        const jawakRefId = inp.jawak_ref_id;
        hmpBatchIn.deleteById(id);
        if (jawakRefId) {
            await Fn.deleteAJ(jawakRefId, 'jawak');
        }
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
        const aawakRefId = out.aawak_ref_id;
        hmpBatchOut.deleteById(id);
        if (aawakRefId) {
            await Fn.deleteAJ(aawakRefId, 'aawak');
        }
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