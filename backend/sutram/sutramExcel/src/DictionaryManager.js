// src/DictionaryManager.js
'use strict';

class DictionaryManager {

    constructor(db) {
        this.db = db;
    }

    // ── LOOKUP — used by RefMatcher ───────────────────────────
    find(type, name) {
        if (!name) return null;
        const clean = this._clean(name);
        return this.db.prepare(
            `SELECT * FROM xls_dictionary WHERE type = ? AND name = ? AND active = 1`
        ).get(type, clean) ?? null;
    }

    // ── ADD — save correction ─────────────────────────────────
    add({ type, name, ref_id, ref_id2 = null, extra_note = null }) {
        if (!type || !name) throw new Error('[sutramexcel] type and name required');
        const clean = this._clean(name);

        const existing = this.db.prepare(
            `SELECT _id FROM xls_dictionary WHERE type = ? AND name = ?`
        ).get(type, clean);

        if (existing) {
            this.db.prepare(`
                UPDATE xls_dictionary
                SET ref_id = ?, ref_id2 = ?, extra_note = ?,
                    active = 1, updated_at = datetime('now','localtime')
                WHERE _id = ?
            `).run(String(ref_id ?? ''), ref_id2 ? String(ref_id2) : null, extra_note, existing._id);
            console.log(`[sutramexcel] Dictionary updated: ${type} "${name}"`);
            return existing._id;
        }

        const result = this.db.prepare(`
            INSERT INTO xls_dictionary (type, name, ref_id, ref_id2, extra_note)
            VALUES (?, ?, ?, ?, ?)
        `).run(type, clean, String(ref_id ?? ''), ref_id2 ? String(ref_id2) : null, extra_note);
        console.log(`[sutramexcel] Dictionary added: ${type} "${name}" → ${ref_id}`);
        return result.lastInsertRowid;
    }

    // ── LIST ──────────────────────────────────────────────────
    list(type = null) {
        if (type) {
            return this.db.prepare(
                `SELECT * FROM xls_dictionary WHERE type = ? AND active = 1 ORDER BY type, name`
            ).all(type);
        }
        return this.db.prepare(
            `SELECT * FROM xls_dictionary WHERE active = 1 ORDER BY type, name`
        ).all();
    }

    // ── UPDATE ────────────────────────────────────────────────
    update(id, { ref_id, ref_id2, extra_note, active }) {
        const fields = [];
        const vals   = [];

        if (ref_id     !== undefined) { fields.push('ref_id = ?');     vals.push(String(ref_id ?? '')); }
        if (ref_id2    !== undefined) { fields.push('ref_id2 = ?');    vals.push(ref_id2 ? String(ref_id2) : null); }
        if (extra_note !== undefined) { fields.push('extra_note = ?'); vals.push(extra_note); }
        if (active     !== undefined) { fields.push('active = ?');     vals.push(active ? 1 : 0); }

        if (fields.length === 0) return;
        fields.push(`updated_at = datetime('now','localtime')`);
        vals.push(id);

        this.db.prepare(`UPDATE xls_dictionary SET ${fields.join(', ')} WHERE _id = ?`).run(...vals);
    }

    // ── DELETE (soft) ─────────────────────────────────────────
    delete(id) {
        this.db.prepare(
            `UPDATE xls_dictionary SET active = 0, updated_at = datetime('now','localtime') WHERE _id = ?`
        ).run(id);
    }

    // ── HARD DELETE ───────────────────────────────────────────
    hardDelete(id) {
        this.db.prepare(`DELETE FROM xls_dictionary WHERE _id = ?`).run(id);
    }

    // ── HELPER ───────────────────────────────────────────────
    _clean(str) {
        return (str || '')
            .toString()
            .trim()
            .normalize('NFC')
            .replace(/\u200B/g, '')
            .replace(/\u00A0/g, ' ')
            .replace(/\s+/g, ' ')
            .toLowerCase();
    }
}

module.exports = DictionaryManager;
