const router = require('express').Router();
const mysql = require('mysql2/promise');

// Helper function to extract table names from procedure definition
function extractTableNamesFromProcedure(definition) {
    const tableNames = [];
    const lines = definition.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Look for TABLE: comments
        const tableCommentMatch = line.match(/--\s*TABLE:\s*(\w+)/i);
        if (tableCommentMatch) {
            tableNames.push(tableCommentMatch[1]);
        }

        // Also check if this line contains a SELECT statement
        if (line.toUpperCase().includes('SELECT') && tableNames.length > 0) {
            // If we have a table name from comment, associate it with this SELECT
            continue;
        }
    }

    return tableNames;
}

// Helper function to extract parameters from procedure definition
function extractParametersFromProcedure(definition) {
    const parameters = [];
    const paramRegex = /\b(IN|OUT|INOUT)\s+(\w+)\s+(\w+(?:\([^)]*\))?)/gi;
    let match;

    while ((match = paramRegex.exec(definition)) !== null) {
        const [, mode, name, type] = match;
        parameters.push({
            name,
            mode: mode.toUpperCase(),
            type: type.toUpperCase()
        });
    }

    return parameters;
}

// Store active connections (in production, use Redis or similar)
const activeConnections = new Map();

// Test MySQL connection
router.post('/test-connection', async (req, res, next) => {
    try {
        const { host, user, password, port = 3306 } = req.body;

        if (!host || !user || !password) {
            return res.status(400).json({
                success: false,
                message: 'Host, user, and password are required'
            });
        }

        // Create connection
        const connection = await mysql.createConnection({
            host,
            user,
            password,
            port: parseInt(port),
            connectTimeout: 5000
        });

        // Test connection
        await connection.execute('SELECT 1');

        // Close connection
        await connection.end();

        res.json({
            success: true,
            message: 'Connection successful'
        });

    } catch (error) {
        console.error('MySQL connection error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Connection failed'
        });
    }
});

// Get list of databases
router.post('/databases', async (req, res, next) => {
    let connection = null;
    try {
        const { host, user, password, port = 3306 } = req.body;

        if (!host || !user || !password) {
            return res.status(400).json({
                success: false,
                message: 'Host, user, and password are required'
            });
        }

        // Create connection
        connection = await mysql.createConnection({
            host,
            user,
            password,
            port: parseInt(port),
            connectTimeout: 5000
        });

        // Get databases
        const [rows] = await connection.execute('SHOW DATABASES');

        // Filter out system databases
        const databases = rows
            .map(row => row.Database)
            .filter(db => !['information_schema', 'mysql', 'performance_schema', 'sys'].includes(db));

        // Store connection for later use
        const connectionId = `${host}_${user}_${Date.now()}`;
        activeConnections.set(connectionId, {
            connection,
            config: { host, user, password, port: parseInt(port) }
        });

        res.json({
            success: true,
            data: databases,
            connectionId
        });

    } catch (error) {
        console.error('Error getting databases:', error);
        if (connection) {
            try {
                await connection.end();
            } catch (e) {
                console.error('Error closing connection:', e);
            }
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get databases'
        });
    }
});

// Get stored procedures for a database
router.post('/procedures/:connectionId', async (req, res, next) => {
    let connection = null;
    try {
        const { connectionId } = req.params;
        const { database } = req.body;

        if (!connectionId || !database) {
            return res.status(400).json({
                success: false,
                message: 'Connection ID and database are required'
            });
        }

        const connectionData = activeConnections.get(connectionId);
        if (!connectionData) {
            return res.status(400).json({
                success: false,
                message: 'Connection not found. Please reconnect.'
            });
        }

        // Create new connection with database selected
        connection = await mysql.createConnection({
            ...connectionData.config,
            database,
            connectTimeout: 5000
        });

        // Get stored procedures
        const [rows] = await connection.execute(`
            SELECT
                ROUTINE_NAME as procedure_name,
                ROUTINE_TYPE as type,
                CREATED as created_date,
                LAST_ALTERED as last_modified
            FROM information_schema.ROUTINES
            WHERE ROUTINE_SCHEMA = ? AND ROUTINE_TYPE = 'PROCEDURE'
            ORDER BY ROUTINE_NAME
        `, [database]);

        console.log('Procedures found:', rows.length);

        // Get all parameters for all procedures in one query
        const [paramRows] = await connection.execute(`
            SELECT
                SPECIFIC_NAME as procedure_name,
                PARAMETER_NAME,
                PARAMETER_MODE,
                DATA_TYPE,
                CHARACTER_MAXIMUM_LENGTH,
                NUMERIC_PRECISION,
                NUMERIC_SCALE,
                ORDINAL_POSITION
            FROM information_schema.PARAMETERS
            WHERE SPECIFIC_SCHEMA = ? AND ROUTINE_TYPE = 'PROCEDURE'
            ORDER BY SPECIFIC_NAME, ORDINAL_POSITION
        `, [database]);

        // console.log('All parameters found:', paramRows.length);

        // Group parameters by procedure
        const paramMap = {};
        paramRows.forEach(param => {
            if (!paramMap[param.procedure_name]) {
                paramMap[param.procedure_name] = [];
            }
            paramMap[param.procedure_name].push({
                name: param.PARAMETER_NAME,
                mode: param.PARAMETER_MODE,
                type: param.DATA_TYPE.toUpperCase(),
                length: param.CHARACTER_MAXIMUM_LENGTH,
                precision: param.NUMERIC_PRECISION,
                scale: param.NUMERIC_SCALE
            });
        });

        // Combine procedures with their parameters
        const proceduresWithParams = rows.map(proc => ({
            ...proc,
            parameters: paramMap[proc.procedure_name] || []
        }));

        // console.log('Final procedures with params:', proceduresWithParams.map(p => ({
        //     name: p.procedure_name,
        //     paramCount: p.parameters.length
        // })));

        // Update stored connection
        activeConnections.set(connectionId, {
            ...connectionData,
            connection,
            database
        });

        res.json({
            success: true,
            data: proceduresWithParams
        });

    } catch (error) {
        console.error('Error getting procedures:', error);
        if (connection) {
            try {
                await connection.end();
            } catch (e) {
                console.error('Error closing connection:', e);
            }
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get stored procedures'
        });
    }
});


// Execute stored procedure
router.post('/execute/:connectionId', async (req, res, next) => {
    let connection = null;
    try {
        const { connectionId } = req.params;
        const { procedureName, parameters = [] } = req.body;

        if (!connectionId || !procedureName) {
            return res.status(400).json({
                success: false,
                message: 'Connection ID and procedure name are required'
            });
        }

        const connectionData = activeConnections.get(connectionId);
        if (!connectionData) {
            return res.status(400).json({
                success: false,
                message: 'Connection not found. Please reconnect.'
            });
        }

        // Create new connection with database selected
        connection = await mysql.createConnection({
            ...connectionData.config,
            database: connectionData.database,
            connectTimeout: 5000
        });

        // Prepare procedure call
        const placeholders = parameters.length > 0 ? parameters.map(() => '?').join(', ') : '';
        const query = `CALL ${procedureName}(${placeholders})`;

        console.log('Executing query:', query, 'with parameters:', parameters);

        // Execute procedure
        const [rows, fields] = await connection.execute(query, parameters.length > 0 ? parameters : []);

        // Process results (MySQL procedures can return multiple result sets)
        let results = [];
        let allColumns = [];

        if (Array.isArray(rows)) {
            // Multiple result sets
            results = rows;
            if (fields && Array.isArray(fields)) {
                allColumns = fields.map(fieldSet => {
                    if (fieldSet && Array.isArray(fieldSet)) {
                        return fieldSet.map(field => ({
                            name: field.name,
                            type: field.type,
                            length: field.length,
                            flags: field.flags
                        }));
                    }
                    return [];
                });
            }
        } else if (rows && typeof rows === 'object') {
            // Single result set
            results = [rows];
            if (fields && Array.isArray(fields) && fields.length > 0) {
                allColumns = [fields.map(field => ({
                    name: field.name,
                    type: field.type,
                    length: field.length,
                    flags: field.flags
                }))];
            } else {
                allColumns = [[]];
            }
        } else {
            // No result sets
            results = [];
            allColumns = [];
        }

        // Prepare response with named result sets
        const namedResults = results.map((result, index) => ({
            tableName: `result_set_${index + 1}`,
            data: result || [],
            columns: allColumns[index] || [],
            rowCount: (result && result.length) || 0
        }));

        res.json({
            success: true,
            results: namedResults,
            totalResultSets: namedResults.length
        });

    } catch (error) {
        console.error('Error executing procedure:', error);
        if (connection) {
            try {
                await connection.end();
            } catch (e) {
                console.error('Error closing connection:', e);
            }
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to execute stored procedure'
        });
    }
});



// Close connection
router.delete('/connection/:connectionId', async (req, res, next) => {
    try {
        const { connectionId } = req.params;

        const connectionData = activeConnections.get(connectionId);
        if (connectionData && connectionData.connection) {
            await connectionData.connection.end();
        }

        activeConnections.delete(connectionId);

        res.json({
            success: true,
            message: 'Connection closed'
        });

    } catch (error) {
        console.error('Error closing connection:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to close connection'
        });
    }
});

module.exports = router;
