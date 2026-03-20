# sutramcore

> सूत्र (Sutram) = thread · formula · foundational connection

Metadata-driven SQLite ORM built on `better-sqlite3`.  
Schema-driven CRUD, automatic joins, type coercion, migrations — no magic, full control.

---

## Install

```bash
npm install sutramcore better-sqlite3
```

---

## Quick Start

```bash
npx sutramcore init
```
Creates `database/schema.js`, `database/migrations.js`, `database/views.js`.

---

## Two Usage Modes

### Mode A — Fresh project (sutramcore manages everything)

```js
// app.js
const { configure } = require('sutramcore');

configure({
    dbPath:     './data/app.db',
    schema:     require('./database/schema'),
    migrations: require('./database/migrations'),
    views:      require('./database/views'),    // optional
});
```

### Mode B — Existing project (bring your own db)

```js
// app.js — for projects already using db.model.js
const { configure }  = require('sutramcore');
const { dbmodal }    = require('./database/db.model');  // your existing db

configure({
    db:     dbmodal.db,                    // pass better-sqlite3 instance directly
    schema: require('./database/schema'),  // rewrite schema.js using defineTable
    // NO migrations — your db.model.js handles those
});
```

Call `configure()` once at startup — before any `BaseTable` usage.

---

## Define Schema

```js
// database/schema.js
const { defineTable, col } = require('sutramcore');

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
    }, {
        // joins — second argument
        categories: {
            manyToMany: true,
            table:      'category',
            junction:   'rel_item_category',
            on:         'item_id',
            target:     'category_id',
            as:         'categories',
            select:     ['_id', 'category_name'],
        },
    }),

};
```

---

## Column Builder

| Builder                        | Stored as     | Returned as      |
|-------------------------------|---------------|------------------|
| `col.id()`                    | INTEGER PK    | number           |
| `col.number()`                | INTEGER/REAL  | number \| null   |
| `col.string()`                | TEXT          | string \| null   |
| `col.boolean().default(1)`    | TINYINT 0/1   | true \| false    |
| `col.json()`                  | TEXT (JSON)   | object \| null   |

Chainable modifiers:
```js
col.string().required()      // throws on insert if missing
col.boolean().default(1)     // used when field absent on insert
col.number().default(0)
```

---

## Join Types

### hasOne — FK on this table
```js
// declare on the FK column
unit_id: col.ref('unit._id', { as: 'unit', select: ['unit_short'] })
unit_id: col.ref('unit._id', { as: 'unit', select: '*' })  // all columns in schema
```
Returns `row.unit = { unit_short: '...' }` or `null` if no match.

### hasMany — FK on other table
```js
// declare in joins{} — second arg of defineTable
inputs: {
    hasMany: true,
    table:   'recipe_input',
    on:      'recipe_id',   // FK column on recipe_input pointing here
    target:  '_id',         // column on THIS table
    as:      'inputs',
    select:  '*',
}
```
Returns `row.inputs = [...]` — always array.  
Nested hasOne joins inside the child are resolved automatically (one level deep).

### manyToMany — through junction table
```js
categories: {
    manyToMany: true,
    table:      'category',
    junction:   'rel_item_category',
    on:         'item_id',       // FK on junction → this table
    target:     'category_id',   // FK on junction → target table
    as:         'categories',
    select:     ['_id', 'category_name'],
}
```
Returns `row.categories = [...]` — always array.

---

## CRUD API

```js
const { BaseTable } = require('sutramcore');
const item = new BaseTable('item');

// INSERT
const newItem = item.insert({ item_name: 'Sugar', unit_id: 1 });       // returns full row
const id      = item.insert({ item_name: 'Salt' }, false);              // returns id only

// UPDATE
item.updateById({ item_name: 'Sugar (refined)' }, 5);
item.update({ active: 0 }, { _id: 5 });
item.update({ active: 0 }, "active = 1 AND unit_id = 2");              // raw where string

// DELETE
item.deleteById(5);
item.delete({ active: 0 });            // object where
item.delete("created_at < '2023'");   // raw where string

// GET ONE
const row = item.getById(5);
const row = item.getOne({ item_name: 'Sugar' });
const row = item.getOne({ _id: 5 }, { full: false });   // plain, no joins

// GET ALL
const rows = item.getAll({ active: 1 });
const rows = item.getAll({ active: 1 }, {
    orderBy: 'item_name ASC',
    limit:   50,
    offset:  0,
    full:    true,    // default — with joins
});
const rows = item.getAll({}, { full: false });           // plain, no joins

// COUNT
const total = item.count({ active: 1 });
```

---

## Transactions

```js
const { BaseTable } = require('sutramcore');

// Automatic — commits on success, rolls back on throw
const batchId = BaseTable.transaction(() => {
    const id = batch.insert(data, false);
    for (const inp of data.inputs) {
        batchInput.insert({ ...inp, batch_id: id }, false);
    }
    return id;
});

// Manual — for router-level or complex cases
BaseTable.begin();
try {
    batch.insert(data, false);
    BaseTable.commit();
} catch (e) {
    BaseTable.rollback();
    throw e;
}
```

> `better-sqlite3` transactions cannot be nested.  
> Use `begin/commit/rollback` for manual control across multiple calls.

---

## Migrations (Mode A)

```js
// database/migrations.js
module.exports = [

    // version 1
    [
        `create table unit(...)`,
        `create table item(...)`,
    ],

    // version 2
    [
        `alter table item add column description text`,
        `DROP TRIGGER IF EXISTS "old_trigger"`,
        `CREATE TRIGGER "new_trigger" ...`,    // drop + create in same version
    ],

];
```

Rules:
- Never edit past versions — add a new array at the end
- Drop + recreate trigger in the **same version array**
- Each version runs in its own transaction — failure rolls back only that version

---

## Raw SQL

```js
const { getDb } = require('sutramcore');
const db = getDb();  // raw better-sqlite3 instance

const rows = db.prepare(`
    SELECT * FROM item
    LEFT JOIN unit ON unit._id = item.unit_id
    WHERE item.active = 1
`).all();
```

---

## Project Structure

```
your-project/
├── app.js                    ← configure() here, once
├── database/
│   ├── schema.js             ← defineTable() + col definitions
│   ├── migrations.js         ← array-of-arrays SQL (Mode A)
│   └── views.js              ← optional SQLite views (Mode A)
├── services/
│   └── item.service.js       ← new BaseTable('item')
└── routes/
    └── item.routes.js
```

### Migrating an existing project (Mode B)

```
existing-project/
├── database/
│   ├── db.model.js      ← KEEP — your 28 migrations stay here
│   ├── schema.js        ← REWRITE using defineTable + col
│   └── db.js            ← ADD — bridge file (see below)
└── app.js               ← ADD configure() call
```

```js
// database/db.js — bridge for existing project
const { configure }  = require('sutramcore');
const { dbmodal }    = require('./db.model');

configure({
    db:     dbmodal.db,
    schema: require('./schema'),
});
```

```js
// app.js — require bridge early
require('./database/db.js');

// all existing services keep working unchanged:
const item = new BaseTable('item');  // reads from sutramcore
```
