# Backend Packages Documentation

## Overview

All backend packages work together to provide the complete business logic and data layer for Sutram Eco-System.

## Package List

| Package | Purpose | Status |
|---------|---------|--------|
| sutramcore | Base ORM for SQLite | Complete |
| sutramcore-mysql | MySQL async adapter | Complete |
| sutramEngine | Main business logic engine | Complete |
| sutramExcel | Excel import/export | Complete |

## 1. SutramCore

### Purpose
Base ORM (Object-Relational Mapping) library for database operations.

### Key Features
- Synchronous operations
- Schema definition in code
- Foreign key resolution
- Query builder API
- Transaction support
- Data caching

### Installation
npm install sutramcore better-sqlite3

### Quick Usage
const { Sutram } = require('sutramcore');
const Database = require('better-sqlite3');

const db = new Database('app.db');
const sewa = new Sutram({ db, schema });
const table = sewa.table('product');
const id = table.insert({ name: 'Widget', price: 99.99 });

### API Methods
- insert(data, full?) - Insert row
- getById(id, opts?) - Get by ID
- getOne(where, opts?) - Get first match
- getAll(where, opts?) - Get all matches
- count(where) - Count rows
- update(data, where, full?) - Update rows
- delete(where) - Delete rows

---

## 2. SutramCore-MySQL

### Purpose
MySQL adapter for SutramCore with async operations and connection pooling.

### Key Features
- Async/await operations
- Connection pooling
- Stored procedure support
- CLI importer tool
- MySQL 5.7+ compatible

### Installation
npm install sutramcore-mysql mysql2

### Quick Usage
const { MySQLSutram } = require('sutramcore-mysql');

const mysql = new MySQLSutram({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'sutram'
});

const product = await mysql.table('product').getById(1);

### Differences from SutramCore
- SutramCore: Sync, SQLite only
- MySQLSutram: Async, MySQL only, connection pooling

---

## 3. SutramEngine

### Purpose
Main business logic engine that wraps SutramCore and adds triggers, reports, UI config.

### Key Features
- 3 initialization patterns
- Trigger-aware CRUD
- Report execution
- UI configuration
- Express router integration
- Transaction management

### Installation
npm install sutramengine sutramcore better-sqlite3

### Quick Usage
const { SutramEngine } = require('sutramengine');

const engine = new SutramEngine({
  dbPath: './app.db',
  schema: require('./schema')
}).init();

engine.insert('product', { name: 'Widget', price: 100 });

### CRUD Operations
- insert(table, data) - Insert row
- getById(table, id) - Get by ID
- getAll(table, where) - Get all
- updateById(table, data, id) - Update
- deleteById(table, id) - Delete

### Triggers
Define trigger actions for INSERT, UPDATE, DELETE:

const triggers = {
  product: {
    AFTER_INSERT: (newRow) => {
      console.log('Added:', newRow.name);
    },
    BEFORE_UPDATE: (newRow, oldRow) => {
      if (oldRow.locked) throw new Error('Locked');
    }
  }
};

### Router
Mount Express router to auto-generate API:

const app = express();
app.use('/api', engine.router());

Routes auto-created:
- GET /_sutram/menu
- GET /_sutram/schema/:table
- GET /:table
- GET /:table/:id
- POST /:table
- PUT /:table/:id
- DELETE /:table/:id

---

## 4. SutramExcel

### Purpose
Schema-driven Excel import/export with FK resolution and dictionary caching.

### Key Features
- Excel file parsing
- Schema-driven validation
- Foreign key resolution
- Dictionary-based translation
- Duplicate detection
- Error reporting

### Installation
npm install sutramexcel exceljs express

### Quick Usage
const { SutramExcel } = require('sutramexcel');
const excel = new SutramExcel(engine);

excel.register(engine.table('product'), {
  headers: {
    sku: { alt_names: ['code', 'item_code'] },
    price: { type: 'number' }
  },
  duplicateOn: ['sku']
});

app.use('/_sutram/excel', excel.router());

### Configuration Options
- headers - Per-column customization
- autoSet - Auto-fill values on import
- duplicateOn - Columns for duplicate detection
- canUpdate - Allow update on duplicate
- autoIncrement - Auto-increment columns
- jsonColumns - Stringify before insert
- booleanColumns - Convert 0/1

### Routes
- GET /_sutram/excel/tables - Registered tables
- GET /_sutram/excel/config/:table - Column config
- POST /_sutram/excel/verify/:table - FK resolve
- POST /_sutram/excel/import/:table - Import row
- POST /_sutram/excel/update/:table - Update row

### Dictionary System
Caches translations and corrections:

excel.dictionary.add({ type: 'unit', name: 'kulo', ref_id: 5 });
const entry = excel.dictionary.find('unit', 'kulo');

---

## Package Dependencies

sutramcore (base)
↓
sutramEngine (wraps sutramcore)
├─ depends on sutramcore
└─ depends on sutramExcel

sutramcore-mysql (alternative)
↓
Can be used with sutramEngine

---

## When to Use Each

### SutramCore
- Simple SQLite applications
- Synchronous operations only
- No need for dynamic schema

### SutramCore-MySQL
- Need async operations
- MySQL database
- High concurrency applications
- Connection pooling needed

### SutramEngine
- Need triggers and reports
- Dynamic schema management
- Full CRUD with business logic
- Express integration needed

### SutramExcel
- Excel import/export needed
- FK validation
- Multi-language support
- Duplicate prevention

---

## Performance Tips

1. Use transactions for multi-step operations
2. Add indexes to frequently queried columns
3. Paginate large result sets
4. Cache schema in memory (default)
5. Use batch operations with transactions

---

## Common Errors

Error: Foreign key not resolving
Fix: Check ref_table and ref_field in schema

Error: Slow queries
Fix: Add limits, use pagination, check indexes

Error: Duplicate primary keys
Fix: Ensure auto-increment is set properly