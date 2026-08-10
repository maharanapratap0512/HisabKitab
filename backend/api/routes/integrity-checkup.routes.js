const router = require('express').Router();
const integrityService = require('../services/integrity-checkup.service');

router.get('/tests', (req, res) => {
    res.json({
        success: true,
        tests: [
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
        const { testId } = req.body;
        let mismatches = [];
        if (testId === 'aawak-remaining-qty-mismatch') {
            mismatches = integrityService.scanRemainingQtyMismatches();
        } else if (testId === 'bachat-stock-mismatch') {
            mismatches = integrityService.scanBachatMismatches();
        } else {
            mismatches = integrityService.scanMismatches();
        }
        res.json({ success: true, result: mismatches });
    } catch (e) {
        next(e);
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
