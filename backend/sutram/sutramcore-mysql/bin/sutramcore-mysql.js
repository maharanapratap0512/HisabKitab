#!/usr/bin/env node
// bin/sutramcore-mysql.js — sutramcore-mysql CLI
'use strict';

const fs   = require('fs');
const path = require('path');

const [,, command, ...args] = process.argv;

const COMMANDS = { import: cmdImport };

if (!command || !COMMANDS[command]) {
    console.log(`
sutramcore-mysql — सूत्र MySQL CLI

Usage:
  npx sutramcore-mysql <command> [options]

Commands:
  import <file.sql>    Generate schema.js (and reports.js) from MySQL SQL export

Options:
  --out <path>         Output directory (default: ./database)
  --reports            Also generate reports.js from stored procedures
  --format cjs         Output format: cjs (default)
`);
    process.exit(0);
}

COMMANDS[command](args);

// ─────────────────────────────────────────────────────────────
// IMPORT COMMAND
// ─────────────────────────────────────────────────────────────

function cmdImport(args) {
    const sqlFile   = args.find(a => !a.startsWith('--'));
    const outDir    = argVal(args, '--out')    ?? './database';
    const genReports = args.includes('--reports');

    if (!sqlFile) {
        console.error('[sutramcore-mysql] Error: SQL file path required');
        console.error('Usage: npx sutramcore-mysql import ./database.sql');
        process.exit(1);
    }

    const sqlPath = path.resolve(process.cwd(), sqlFile);

    if (!fs.existsSync(sqlPath)) {
        console.error(`[sutramcore-mysql] File not found: ${sqlPath}`);
        process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log(`[sutramcore-mysql] Reading: ${sqlPath}`);

    // parse
    const SQLParser       = require('../src/cli/SQLParser');
    const SchemaGenerator = require('../src/cli/SchemaGenerator');
    const ReportsGenerator = require('../src/cli/ReportsGenerator');

    const parser = new SQLParser();
    const parsed = parser.parse(sql);

    console.log(`[sutramcore-mysql] Found ${parsed.tables.length} table(s), ${parsed.procedures.length} procedure(s)`);

    // ensure output dir
    const outPath = path.resolve(process.cwd(), outDir);
    if (!fs.existsSync(outPath)) {
        fs.mkdirSync(outPath, { recursive: true });
        console.log(`[sutramcore-mysql] Created ${outDir}/`);
    }

    // generate schema.js
    const schemaGen = new SchemaGenerator();
    const { code: schemaCode, warnings } = schemaGen.generate(parsed.tables);

    const schemaFile = path.join(outPath, 'schema.js');
    writeIfConfirmed(schemaFile, schemaCode);

    // warnings
    if (warnings.length) {
        console.log('\n⚠ Warnings:');
        warnings.forEach(w => console.log('  ' + w));
    }

    console.log('\n✓ Done:');
    console.log(`  ${schemaFile}`);

    // generate reports.js if --reports flag
    if (genReports) {
        const reportsGen = new ReportsGenerator();
        const { code: reportsCode } = reportsGen.generate(parsed.procedures);

        const reportsFile = path.join(outPath, 'reports.js');
        writeIfConfirmed(reportsFile, reportsCode);
        console.log(`  ${reportsFile}`);
    }

    console.log('\n⚠ Manual steps needed:');
    console.log('  1. Review schema.js — check col types');
    console.log('  2. Add joins{} for hasMany and manyToMany relations');
    console.log('  3. Add display_format for dropdown columns (ui.js)');
    if (genReports) {
        console.log('  4. Add default values and labels to reports.js params');
    }
    console.log('');
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function writeIfConfirmed(filePath, content) {
    const name = path.basename(filePath);
    if (fs.existsSync(filePath)) {
        console.log(`[sutramcore-mysql] Overwriting ${name}`);
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[sutramcore-mysql] ✓ Written ${name}`);
}

function argVal(args, flag) {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : null;
}
