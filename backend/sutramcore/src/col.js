// src/col.js
// ─────────────────────────────────────────────────────────────
// Schema column builder.
// Gives users IntelliSense-friendly API instead of raw objects.
//
// Usage:
//   const { col } = require('sutramcore');
//
//   col.id()                          → { type: 'number' }
//   col.string()                      → ColBuilder → { type: 'string' }
//   col.boolean().default(1)          → { type: 'boolean', default: 1 }
//   col.ref('unit._id', {            → { type: 'number', ref: 'unit._id',
//       as: 'unit',                        as: 'unit',
//       select: ['unit_short']             select: ['unit_short'] }
//   })
// ─────────────────────────────────────────────────────────────

'use strict';

class ColBuilder {
    constructor(type) {
        this._def = { type };
    }

    // Set a default value applied on insert when field is absent
    default(val) {
        this._def.default = val;
        return this;
    }

    // Mark field as required — sanitize will throw if missing on insert
    required() {
        this._def.required = true;
        return this;
    }

    // hasOne join — declare ref directly on the FK column
    // refPath: 'unit._id'
    // opts: { as: 'unit', select: ['unit_short', 'unit_full'] | '*' }
    ref(refPath, { as, select = '*' } = {}) {
        if (!refPath.includes('.')) {
            throw new Error(`[sutramcore] col.ref() path must be "table.column" — got "${refPath}"`);
        }
        this._def.ref    = refPath;
        this._def.as     = as ?? refPath.split('.')[0];
        this._def.select = select;
        return this;
    }

    // Resolve to plain object — called by defineTable()
    build() {
        return { ...this._def };
    }
}

const col = {
    // Primary key shorthand
    id: () => ({ type: 'number' }),

    // Scalar types — return ColBuilder so .default() .required() .ref() can chain
    number:  () => new ColBuilder('number'),
    string:  () => new ColBuilder('string'),
    boolean: () => new ColBuilder('boolean'),
    json:    () => new ColBuilder('json'),

    // hasOne shorthand — same as col.number().ref(...)
    // refPath: 'unit._id'
    // opts: { as: 'unit', select: ['unit_short', 'unit_full'] | '*' }
    ref: (refPath, { as, select = '*' } = {}) => {
        return new ColBuilder('number').ref(refPath, { as, select });
    },
};

module.exports = { col, ColBuilder };
