// src/cli/SQLParser.js
// ─────────────────────────────────────────────────────────────
// Parses MySQL exported .sql file.
// Extracts:
//   - CREATE TABLE statements → column definitions
//   - CREATE PROCEDURE statements → procedure definitions
//   - FOREIGN KEY constraints → col.ref() hints
// ─────────────────────────────────────────────────────────────

'use strict';

class SQLParser {

    parse(sql) {
        const cleaned = this._clean(sql);
        return {
            tables:     this._parseTables(cleaned),
            procedures: this._parseProcedures(cleaned),
        };
    }

    // ─────────────────────────────────────────────────────────
    // CLEAN — strip comments, normalize whitespace
    // ─────────────────────────────────────────────────────────

    _clean(sql) {
        return sql
            .replace(/--[^\n]*/g, '')           // single line comments
            .replace(/\/\*[\s\S]*?\*\//g, '')   // block comments
            .replace(/\r\n/g, '\n')
            .replace(/\t/g, ' ')
            .replace(/ {2,}/g, ' ');
    }

    // ─────────────────────────────────────────────────────────
    // PARSE TABLES
    // ─────────────────────────────────────────────────────────

    _parseTables(sql) {
        const tables = [];

        // Find each CREATE TABLE and extract body by counting parentheses
        const headerRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?(\w+)`?\s*\(/gi;
        let match;

        while ((match = headerRegex.exec(sql)) !== null) {
            const tableName = match[1];
            if (tableName.startsWith('sys_')) continue;

            // extract body by counting balanced parentheses
            const body = this._extractBody(sql, match.index + match[0].length - 1);
            if (!body) continue;

            const { columns, foreignKeys } = this._parseTableBody(tableName, body);
            tables.push({ tableName, columns, foreignKeys });
        }

        return tables;
    }

    // Extract balanced parentheses content starting at openPos
    _extractBody(sql, openPos) {
        let depth = 0;
        let start = -1;
        for (let i = openPos; i < sql.length; i++) {
            if (sql[i] === '(') {
                if (depth === 0) start = i + 1;
                depth++;
            } else if (sql[i] === ')') {
                depth--;
                if (depth === 0) {
                    return sql.slice(start, i);
                }
            }
        }
        return null;
    }

    _parseTableBody(tableName, body) {
        const lines      = body.split('\n').map(l => l.trim()).filter(Boolean);
        const columns    = [];
        const foreignKeys = [];

        for (const line of lines) {
            // skip PRIMARY KEY, INDEX, UNIQUE KEY lines
            if (/^(PRIMARY\s+KEY|KEY|INDEX|UNIQUE)/i.test(line)) continue;

            // FOREIGN KEY — can be on same line or multiline
            const fkMatch = line.match(
                /FOREIGN\s+KEY\s*\(`?(\w+)`?\)\s+REFERENCES\s+`?(\w+)`?\s*\(`?(\w+)`?\)/i
            ) || line.match(
                /CONSTRAINT\s+`?\w+`?\s+FOREIGN\s+KEY\s*\(`?(\w+)`?\)\s+REFERENCES\s+`?(\w+)`?\s*\(`?(\w+)`?\)/i
            );
            if (fkMatch) {
                foreignKeys.push({
                    column:    fkMatch[1],
                    refTable:  fkMatch[2],
                    refColumn: fkMatch[3],
                });
                continue;
            }

            // column definition
            const colMatch = line.match(/^`?(\w+)`?\s+(.+?)(?:\s*,\s*)?$/);
            if (!colMatch) continue;

            const colName  = colMatch[1];
            const colDef   = colMatch[2];

            if (colName === 'PRIMARY' || colName === 'FOREIGN' || colName === 'UNIQUE' || colName === 'KEY') continue;

            columns.push({
                name:         colName,
                ...this._parseColumnDef(colName, colDef),
            });
        }

        return { columns, foreignKeys };
    }

    _parseColumnDef(colName, def) {
        const defUp      = def.toUpperCase();
        const isNotNull  = /NOT\s+NULL/i.test(def);
        const isAutoInc  = /AUTO_INCREMENT/i.test(def);
        const isPK       = /PRIMARY\s+KEY/i.test(def);

        // extract DEFAULT value
        let defaultVal = null;
        const defMatch = def.match(/DEFAULT\s+('([^']*)'|(\S+))/i);
        if (defMatch) {
            defaultVal = defMatch[2] !== undefined ? defMatch[2] : defMatch[3];
            if (defaultVal === 'NULL') defaultVal = null;
        }

        // type mapping
        let type = 'string';
        if (isPK || isAutoInc) {
            type = 'number';
        } else if (/^(INT|BIGINT|SMALLINT|MEDIUMINT|TINYINT\s*\(\s*[2-9])/i.test(def)) {
            type = 'number';
        } else if (/^TINYINT(\s*\(\s*1\s*\))?(?!\s*\([2-9])/i.test(def)) {
            type = 'boolean';
            if (defaultVal === '1') defaultVal = 1;
            if (defaultVal === '0') defaultVal = 0;
        } else if (/^(DECIMAL|FLOAT|DOUBLE|NUMERIC)/i.test(def)) {
            type = 'number';
            if (defaultVal) defaultVal = Number(defaultVal);
        } else if (/^(JSON|LONGTEXT)/i.test(def)) {
            type = 'json';
        } else {
            type = 'string';
        }

        // number + boolean defaults
        if (type === 'number' && defaultVal !== null && !isNaN(defaultVal)) {
            defaultVal = Number(defaultVal);
        }
        if (type === 'boolean' && defaultVal !== null && !isNaN(defaultVal)) {
            defaultVal = Number(defaultVal);
        }

        return {
            type,
            isPK:       isPK || isAutoInc,
            isRequired: isNotNull && !isPK && !isAutoInc && defaultVal === null,
            default:    defaultVal,
        };
    }

    // ─────────────────────────────────────────────────────────
    // PARSE PROCEDURES
    // ─────────────────────────────────────────────────────────

    _parseProcedures(sql) {
        const procedures = [];

        // match CREATE PROCEDURE name(params) BEGIN ... END
        const spRegex = /CREATE\s+(?:DEFINER\s*=\s*\S+\s+)?PROCEDURE\s+`?(\w+)`?\s*\(([\s\S]*?)\)\s*(?:BEGIN|READS|MODIFIES|CONTAINS|NO\s+SQL|COMMENT)/gi;

        let match;
        while ((match = spRegex.exec(sql)) !== null) {
            const procName  = match[1];
            const paramStr  = match[2].trim();
            const params    = this._parseProcParams(paramStr);

            procedures.push({ name: procName, params });
        }

        return procedures;
    }

    _parseProcParams(paramStr) {
        if (!paramStr) return [];

        return paramStr
            .split(',')
            .map(p => p.trim())
            .filter(Boolean)
            .map(p => {
                // IN param_name datatype | OUT param_name datatype | param_name datatype
                const m = p.match(/^(?:(IN|OUT|INOUT)\s+)?`?(\w+)`?\s+(.+)$/i);
                if (!m) return null;

                const direction = (m[1] ?? 'IN').toUpperCase();
                const name      = m[2];
                const datatype  = m[3].trim();

                // map MySQL type to JS type
                let type = 'string';
                if (/^(INT|BIGINT|SMALLINT|DECIMAL|FLOAT|DOUBLE)/i.test(datatype)) type = 'number';
                if (/^TINYINT(\(1\))?$/i.test(datatype)) type = 'boolean';

                return { name, type, direction };
            })
            .filter(p => p && p.direction !== 'OUT');  // skip OUT params
    }
}

module.exports = SQLParser;
