const express = require('express');
const router = express.Router();

const db = require('../db/connection');
const BaseTable = require('../database/base.table');

// ── Simple table instances ──
const Prastav = new BaseTable('prastav');
const PrastavJawak = new BaseTable('prastav_jawak');

// ── Prastav main ──────────────────────────────────────────────

// Create / update prastav
router.post('/', (req, res, next) => {
    try {
        const data = req.body || {};
        let prastavId;

        if (data._id) {
            const [sql, params] = Prastav.buildUpdate(data, [{ col: '_id', val: data._id }]);
            db.prepare(sql).run(...params);
            prastavId = data._id;
        } else {
            const [sql, params] = Prastav.buildInsert(data);
            prastavId = db.prepare(sql).run(...params).lastInsertRowid;
        }

        res.status(200).json({ success: true, result: prastavId });
    } catch (e) {
        next(e);
    }
});

// Delete prastav (and its jawaks)
router.delete('/:id', (req, res, next) => {
    try {
        const id = req.params.id;
        db.prepare(`DELETE FROM prastav_jawak WHERE prastav_id = ?`).run(id);
        const changes = db.prepare(`DELETE FROM prastav WHERE _id = ?`).run(id).changes;
        res.status(200).json({ success: true, result: changes });
    } catch (e) {
        next(e);
    }
});

// ── Prastav Jawak lines ───────────────────────────────────────

// Create / update single prastav_jawak line
router.post('/jawak', (req, res, next) => {
    try {
        const data = req.body || {};
        let lineId;

        if (data._id) {
            const [sql, params] = PrastavJawak.buildUpdate(data, [{ col: '_id', val: data._id }]);
            db.prepare(sql).run(...params);
            lineId = data._id;
        } else {
            const [sql, params] = PrastavJawak.buildInsert(data);
            lineId = db.prepare(sql).run(...params).lastInsertRowid;
        }

        res.status(200).json({ success: true, result: lineId });
    } catch (e) {
        next(e);
    }
});

// Delete single prastav_jawak line
router.delete('/jawak/:id', (req, res, next) => {
    try {
        const id = req.params.id;
        const changes = db.prepare(`DELETE FROM prastav_jawak WHERE _id = ?`).run(id).changes;
        res.status(200).json({ success: true, result: changes });
    } catch (e) {
        next(e);
    }
});

module.exports = router;

