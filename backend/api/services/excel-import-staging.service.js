// services/excel-import-staging.service.js
// Handles SQLite staging and session persistence for resumable, dynamic Excel imports using Sutram BaseTable.

const { sutramDB } = require('../database/db.model');
const BaseTable = require('../database/base.table');
const sessionTable = new BaseTable('excel_import_session');
const stagingTable = new BaseTable('excel_import_staging');

class ExcelImportStagingService {

    /**
     * Get active session and pending rows for a department.
     * @param {number|string} deptId 
     * @param {string|null} importType 
     */
    getActiveSession(deptId, importType = null) {
        try {
            const safeDeptId = Number(deptId) || 0;
            const conditions = [`dept_id = ${safeDeptId}`];
            if (importType) {
                conditions.push(`import_type = '${String(importType).trim()}'`);
            }
            const whereStr = conditions.join(' AND ');

            // Fetch latest session for this department/type
            const sessions = sessionTable.getAll(whereStr, {
                full: false,
                orderBy: '_id DESC',
                limit: 1
            });

            if (!sessions || sessions.length === 0) {
                return null;
            }

            const session = sessions[0];

            // Fetch only pending (un-imported) rows
            const pendingRows = stagingTable.getAll(`session_id = ${session._id} AND is_imported = 0`, {
                full: false,
                orderBy: 'row_index ASC'
            });

            if (!pendingRows || pendingRows.length === 0) {
                // If all rows are imported, clean up session
                this.clearSession(safeDeptId, session.import_type);
                return null;
            }

            const parseJson = (val, fallback = []) => {
                if (typeof val === 'object' && val !== null) return val;
                if (typeof val === 'string') {
                    try { return JSON.parse(val); } catch { return fallback; }
                }
                return fallback;
            };

            return {
                session: {
                    _id: session._id,
                    dept_id: session.dept_id,
                    import_type: session.import_type,
                    file_name: session.file_name,
                    step_no: session.step_no,
                    header_config: parseJson(session.header_config, []),
                    header_list: parseJson(session.header_list, []),
                    unmatched_data: parseJson(session.unmatched_data, []),
                    total_count: session.total_count,
                    processed_count: session.processed_count
                },
                pendingRows: pendingRows.map(r => {
                    const rowData = (typeof r.row_data === 'object' && r.row_data !== null)
                        ? r.row_data
                        : JSON.parse(r.row_data || '{}');
                    return {
                        _staging_id: r._id,
                        row_index: r.row_index,
                        ...rowData
                    };
                }),
                totalPending: pendingRows.length,
                totalCount: session.total_count
            };
        } catch (err) {
            console.error('[ExcelImportStagingService] getActiveSession error:', err);
            return null;
        }
    }

    /**
     * Initialize a new import session and stage all incoming rows.
     */
    initSession({ deptId, importType, fileName, stepNo = 2, headerConfig = [], headerList = [], unmatchedData = [], rows = [] }) {
        const needTx = !sutramDB.db.inTransaction;
        try {
            if (needTx) sutramDB.begin();

            const safeDeptId = Number(deptId) || 0;

            // Clear any existing session for this dept/type first
            this.clearSession(safeDeptId, importType);

            const sessionRecord = {
                dept_id: safeDeptId,
                import_type: String(importType).trim(),
                file_name: fileName || null,
                step_no: Number(stepNo) || 2,
                header_config: headerConfig,
                header_list: headerList,
                unmatched_data: unmatchedData || [],
                total_count: rows.length,
                processed_count: 0
            };

            const sessionId = sessionTable.insert(sessionRecord, false);

            for (let i = 0; i < rows.length; i++) {
                stagingTable.insert({
                    session_id: sessionId,
                    dept_id: safeDeptId,
                    row_index: i,
                    row_data: rows[i],
                    status: 'pending',
                    is_imported: 0
                }, false);
            }

            if (needTx) sutramDB.commit();

            return {
                success: true,
                sessionId,
                totalCount: rows.length
            };
        } catch (err) {
            if (needTx && sutramDB.db.inTransaction) sutramDB.rollback();
            console.error('[ExcelImportStagingService] initSession error:', err);
            throw err;
        }
    }

    /**
     * Update current step and optionally unmatched data or headers in session.
     */
    updateSessionStep(sessionId, stepNo, unmatchedData = null, headerList = null) {
        try {
            const updateObj = { step_no: Number(stepNo) };
            if (unmatchedData !== null) updateObj.unmatched_data = unmatchedData;
            if (headerList !== null) updateObj.header_list = headerList;

            sessionTable.updateById(updateObj, sessionId, false);
            return { success: true };
        } catch (err) {
            console.error('[ExcelImportStagingService] updateSessionStep error:', err);
            throw err;
        }
    }

    /**
     * Save updated staging rows (e.g. after corrections or manual edits).
     */
    syncStagingRows(sessionId, rows) {
        const needTx = !sutramDB.db.inTransaction;
        try {
            if (needTx) sutramDB.begin();

            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const cleanRow = { ...row };
                const stagingId = cleanRow._staging_id;
                const rowIdx = cleanRow.row_index !== undefined ? cleanRow.row_index : i;
                delete cleanRow._staging_id;
                delete cleanRow.row_index;

                if (stagingId) {
                    stagingTable.updateById({
                        row_data: cleanRow
                    }, stagingId, false);
                } else {
                    stagingTable.update({
                        row_data: cleanRow
                    }, { session_id: sessionId, row_index: rowIdx }, false);
                }
            }

            if (needTx) sutramDB.commit();
            return { success: true };
        } catch (err) {
            if (needTx && sutramDB.db.inTransaction) sutramDB.rollback();
            console.error('[ExcelImportStagingService] syncStagingRows error:', err);
            throw err;
        }
    }

    /**
     * Remove an imported row from staging table (so only pending rows remain saved).
     */
    markRowImported(sessionId, rowIndex) {
        try {
            // Delete the row from staging table so only pending rows remain
            stagingTable.delete({ session_id: sessionId, row_index: rowIndex });
            return { success: true };
        } catch (err) {
            console.error('[ExcelImportStagingService] markRowImported error:', err);
            return { success: false, error: err.message };
        }
    }

    /**
     * Clear all sessions and staging rows for a department.
     */
    clearSession(deptId, importType = null) {
        const needTx = !sutramDB.db.inTransaction;
        try {
            if (needTx) sutramDB.begin();

            const safeDeptId = Number(deptId) || 0;
            const conditions = [`dept_id = ${safeDeptId}`];
            if (importType) {
                conditions.push(`import_type = '${String(importType).trim()}'`);
            }
            const whereStr = conditions.join(' AND ');

            const sessions = sessionTable.getAll(whereStr, { full: false });
            for (const s of sessions) {
                stagingTable.delete({ session_id: s._id });
                sessionTable.deleteById(s._id);
            }

            if (needTx) sutramDB.commit();
            return { success: true };
        } catch (err) {
            if (needTx && sutramDB.db.inTransaction) sutramDB.rollback();
            console.error('[ExcelImportStagingService] clearSession error:', err);
            throw err;
        }
    }
}

module.exports = new ExcelImportStagingService();
