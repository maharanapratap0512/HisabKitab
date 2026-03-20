#!/usr/bin/env node
// bin/sutramcore.js — sutramcore CLI
'use strict';

const fs   = require('fs');
const path = require('path');

const [,, command] = process.argv;

const COMMANDS = { init: cmdInit };

if (!command || !COMMANDS[command]) {
    console.log(`
sutramcore — सूत्र CLI

Usage:
  npx sutramcore <command>

Commands:
  init    Create starter database/ folder with schema.js, migrations.js, views.js
`);
    process.exit(0);
}

COMMANDS[command]();

function cmdInit() {
    const dbDir = path.resolve(process.cwd(), 'database');
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
        console.log('[sutramcore] Created database/');
    }
    writeIfNotExists(path.join(dbDir, 'schema.js'), SCHEMA_TEMPLATE);
    writeIfNotExists(path.join(dbDir, 'migrations.js'), MIGRATIONS_TEMPLATE);
    writeIfNotExists(path.join(dbDir, 'views.js'), VIEWS_TEMPLATE);
    console.log(`
[sutramcore] ✓ Init complete

Next steps:
  1. Edit database/schema.js     — define your tables
  2. Edit database/migrations.js — add your CREATE TABLE sql
  3. In your app.js:

     const { configure } = require('sutramcore');

     configure({
         dbPath:     './data/app.db',
         schema:     require('./database/schema'),
         migrations: require('./database/migrations'),
         views:      require('./database/views'),
     });
`);
}

function writeIfNotExists(filePath, content) {
    const name = path.basename(filePath);
    if (fs.existsSync(filePath)) {
        console.log(`[sutramcore] Skipped ${name} (already exists)`);
        return;
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[sutramcore] Created database/${name}`);
}

// ─── Templates ───────────────────────────────────────────────

const SCHEMA_TEMPLATE = `// database/schema.js
const { defineTable, col } = require('sutramcore');

// ── Column types ──────────────────────────────────────────────
//   col.id()                           primary key
//   col.number()                       integer / decimal
//   col.string()                       varchar / text
//   col.boolean().default(1)           tinyint stored as 0/1
//   col.json()                         JSON auto stringify/parse
//
// ── hasOne join — FK on THIS table ───────────────────────────
//   unit_id: col.ref('unit._id', { as: 'unit', select: ['unit_short'] })
//   unit_id: col.ref('unit._id', { as: 'unit', select: '*' })
//
// ── hasMany — FK on OTHER table — in joins{} ──────────────────
//   items: { hasMany: true, table: 'item', on: 'category_id', target: '_id', as: 'items', select: '*' }
//
// ── manyToMany — through junction — in joins{} ───────────────
//   categories: { manyToMany: true, table: 'category', junction: 'rel_item_category', on: 'item_id', target: 'category_id', as: 'categories', select: '*' }

module.exports = {

    ...defineTable('unit', {
        _id:        col.id(),
        unit_short: col.string(),
        unit_full:  col.string(),
        active:     col.boolean().default(1),
    }),

    ...defineTable('item', {
        _id:       col.id(),
        item_name: col.string(),
        unit_id:   col.ref('unit._id', {
                       as:     'unit',
                       select: ['unit_short', 'unit_full'],
                   }),
        active:    col.boolean().default(1),
    }),

};
`;

const MIGRATIONS_TEMPLATE = `// database/migrations.js
// Each version = array of SQL strings. Never edit past versions.
// Add a new array at the END for each change.
//
// Rules:
//   - DROP trigger BEFORE recreating — both in same version array
//   - Use IF NOT EXISTS / IF EXISTS for safety
//   - user_version pragma tracks applied versions automatically

module.exports = [

    // version 1 — initial tables
    [
        \`create table if not exists unit(
            _id        integer unique primary key AUTOINCREMENT,
            unit_short varchar(50) unique not null,
            unit_full  varchar(100),
            active     tinyint default 1,
            created_at timestamp default (datetime('now', 'localtime')),
            updated_at timestamp default (datetime('now', 'localtime'))
        )\`,

        \`create table if not exists item(
            _id       integer unique primary key AUTOINCREMENT,
            item_name varchar(150) unique not null,
            unit_id   integer references unit(_id),
            active    tinyint default 1,
            created_at timestamp default (datetime('now', 'localtime')),
            updated_at timestamp default (datetime('now', 'localtime'))
        )\`,
    ],

    // version 2 — example: add a column
    // [
    //     \`alter table item add column description text\`,
    // ],

];
`;

const VIEWS_TEMPLATE = `// database/views.js
// Recreated on every startup — always use CREATE VIEW IF NOT EXISTS.

module.exports = [

    // \`create view if not exists active_items as
    //     select item.*, unit.unit_short
    //     from item
    //     left join unit on unit._id = item.unit_id
    //     where item.active = 1\`,

];
`;
