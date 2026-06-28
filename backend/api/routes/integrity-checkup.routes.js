const router = require('express').Router();
const integrityService = require('../services/integrity-checkup.service');

router.get('/tests', (req, res) => {
    res.json({
        success: true,
        tests: [
            {
                id: 'jawak-aawak-ref-mismatch',
                name: 'Jawak Reference Mismatch',
                description: 'Compare Jawak record columns (Main MM ID, Item ID, Subitem ID, Unit ID) against its referenced Aawak record. Displays mismatched rows and aligns Jawak columns to match the reference Aawak record.'
            }
        ]
    });
});

router.post('/scan', async (req, res, next) => {
    try {
        const mismatches = integrityService.scanMismatches();
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
        const { mismatches } = req.body;
        if (!mismatches || !Array.isArray(mismatches)) {
            writeLog('[Error] Invalid mismatches list.');
            res.end();
            return;
        }

        const count = await integrityService.resolveMismatches(mismatches, writeLog);
        res.write(JSON.stringify({ type: 'complete', count: count }) + '\n');
        res.end();
    } catch (err) {
        writeLog(`[Error] ${err.message}`);
        res.end();
    }
});

module.exports = router;
