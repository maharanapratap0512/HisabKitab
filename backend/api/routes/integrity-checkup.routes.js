const router = require('express').Router();
const integrityService = require('../services/integrity-checkup.service');

router.get('/tests', (req, res) => {
    res.json({
        success: true,
        tests: [
            {
                id: 'duplicate-aj-assumption',
                name: 'Duplicate Aawak & Jawak Assumption',
                description: 'Detect potential duplicate Aawak and Jawak entries based on customizable comparison columns. Displays connected relation counts, streams findings in real-time, and provides inline Edit and Delete options.'
            },
            {
                id: 'jawak-aawak-ref-mismatch',
                name: 'Jawak Reference Mismatch',
                description: 'Compare Jawak record columns (Main MM ID, Item ID, Subitem ID, Unit ID) against its referenced Aawak record via rel_aawak_jawak relation table. Displays mismatched rows and aligns Jawak columns to match the reference Aawak record.'
            },
            {
                id: 'aawak-remaining-qty-mismatch',
                name: 'Aawak Remaining Qty Mismatch',
                description: 'Verify if total split quantity deducted by connected Jawak records (in rel_aawak_jawak) accurately matches the stored remaining_qty in Aawak records. Recalculates and restores the correct remaining_qty.'
            },
            {
                id: 'bachat-stock-mismatch',
                name: 'Bachat & Bachat_New Stock Mismatch',
                description: 'Verifies Stock, Used, and Condition-wise quantities in Bachat & Bachat_New summary tables against actual Aawak and Jawak entries. Rebuilds Bachat tables completely.'
            }
        ]
    });
});

router.post('/scan', async (req, res, next) => {
    try {
        const { testId, selectedColumns } = req.body;
        let mismatches = [];
        if (testId === 'duplicate-aj-assumption') {
            mismatches = integrityService.scanDuplicateMismatches(selectedColumns);
        } else if (testId === 'aawak-remaining-qty-mismatch') {
            const raw = integrityService.scanRemainingQtyMismatches();
            mismatches = raw.map(m => ({
                ...m,
                _id: m.aawak_id,
                name: `Date: ${m.aawak_date} | Item: ${m.aawak_item_hin}${m.aawak_subitem_hin ? ' - ' + m.aawak_subitem_hin : ''} | MM: ${m.aawak_mm_hin}`,
                issue: `Stored: ${m.stored_remaining_qty} ${m.aawak_unit_short} (Gap: ${m.difference_qty})`,
                expected: `${m.expected_remaining_qty} ${m.aawak_unit_short}`
            }));
        } else if (testId === 'bachat-stock-mismatch') {
            const raw = integrityService.scanBachatMismatches();
            mismatches = raw.map(m => ({
                ...m,
                _id: m.bachat_id || `D${m.dept_id}-M${m.mm_id}-I${m.item_id}`,
                name: `Dept: ${m.dept_hin} | MM: ${m.mm_hin} | Item: ${m.item_hin}`,
                issue: `Stored Stock: ${m.stored_stock} | Used: ${m.stored_used}`,
                expected: `Expected Stock: ${m.expected_stock} | Used: ${m.expected_used}`
            }));
        } else {
            const raw = integrityService.scanMismatches();
            mismatches = raw.map(m => ({
                ...m,
                _id: m.jawak_id,
                name: `Jawak Date: ${m.jawak_date} | Item: ${m.jawak_item_hin}`,
                issue: `Jawak MM: ${m.jawak_mm_hin} | Aawak MM: ${m.aawak_mm_hin}`,
                expected: `Sync to Aawak ID: ${m.aawak_id}`
            }));
        }
        res.json({ success: true, result: mismatches });
    } catch (e) {
        next(e);
    }
});

router.post('/scan-stream', async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');

    const writeLog = (msg) => {
        res.write(JSON.stringify({ type: 'log', message: msg }) + '\n');
    };

    const writeGroup = (groupObj) => {
        res.write(JSON.stringify({ type: 'group', group: groupObj }) + '\n');
    };

    try {
        const { testId, selectedColumns } = req.body;
        if (testId === 'duplicate-aj-assumption') {
            const results = integrityService.scanDuplicateMismatches(selectedColumns, writeGroup, writeLog);
            res.write(JSON.stringify({ type: 'complete', count: results.length }) + '\n');
        } else {
            writeLog('[Notice] Legacy test scan started via stream...');
            let mismatches = [];
            
            if (testId === 'aawak-remaining-qty-mismatch') {
                const raw = integrityService.scanRemainingQtyMismatches();
                mismatches = raw.map(m => ({
                    ...m,
                    _id: m.aawak_id,
                    name: `Date: ${m.aawak_date} | Item: ${m.aawak_item_hin}${m.aawak_subitem_hin ? ' - ' + m.aawak_subitem_hin : ''} | MM: ${m.aawak_mm_hin}`,
                    issue: `Stored: ${m.stored_remaining_qty} ${m.aawak_unit_short} (Gap: ${m.difference_qty})`,
                    expected: `${m.expected_remaining_qty} ${m.aawak_unit_short}`
                }));
            } else if (testId === 'bachat-stock-mismatch') {
                const raw = integrityService.scanBachatMismatches();
                mismatches = raw.map(m => ({
                    ...m,
                    _id: m.bachat_id || `D${m.dept_id}-M${m.mm_id}-I${m.item_id}`,
                    name: `Dept: ${m.dept_hin} | MM: ${m.mm_hin} | Item: ${m.item_hin}`,
                    issue: `Stored Stock: ${m.stored_stock} | Used: ${m.stored_used}`,
                    expected: `Expected Stock: ${m.expected_stock} | Used: ${m.expected_used}`
                }));
            } else if (testId === 'jawak-aawak-ref-mismatch') {
                const raw = integrityService.scanMismatches();
                mismatches = raw.map(m => ({
                    ...m,
                    _id: m.jawak_id,
                    name: `Jawak Date: ${m.jawak_date} | Item: ${m.jawak_item_hin}`,
                    issue: `Jawak MM: ${m.jawak_mm_hin} | Aawak MM: ${m.aawak_mm_hin}`,
                    expected: `Sync to Aawak ID: ${m.aawak_id}`
                }));
            }

            res.write(JSON.stringify({ type: 'complete', count: mismatches.length, result: mismatches }) + '\n');
        }
        res.end();
    } catch (err) {
        writeLog(`[Error] Streaming scan failed: ${err.message}`);
        res.end();
    }
});

router.post('/resolve', async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');

    const writeLog = (msg) => {
        res.write(JSON.stringify({ type: 'log', message: msg }) + '\n');
    };

    try {
        const { mismatches, testId } = req.body;
        if (!mismatches || !Array.isArray(mismatches)) {
            writeLog('[Error] Invalid mismatches list.');
            res.end();
            return;
        }

        let count = 0;
        if (testId === 'aawak-remaining-qty-mismatch') {
            count = await integrityService.resolveRemainingQtyMismatches(mismatches, writeLog);
        } else if (testId === 'bachat-stock-mismatch') {
            count = await integrityService.resolveBachatMismatches(mismatches, writeLog);
        } else {
            count = await integrityService.resolveMismatches(mismatches, writeLog);
        }
        res.write(JSON.stringify({ type: 'complete', count: count }) + '\n');
        res.end();
    } catch (err) {
        writeLog(`[Error] ${err.message}`);
        res.end();
    }
});

router.post('/rebuild-bachat', async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');

    const writeLog = (msg) => {
        res.write(JSON.stringify({ type: 'log', message: msg }) + '\n');
    };

    try {
        const count = await integrityService.rebuildAllBachat(writeLog);
        res.write(JSON.stringify({ type: 'complete', count: count }) + '\n');
        res.end();
    } catch (err) {
        writeLog(`[Error] ${err.message}`);
        res.end();
    }
});

module.exports = router;
