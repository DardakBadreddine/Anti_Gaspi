const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

/**
 * Initialize SQLite database with schema
 * @param {string} dbPath - Path to database file
 * @returns {Database} SQLite database instance
 */
function initializeDatabase(dbPath) {
    // Ensure database directory exists
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    // Create or open database
    const db = new Database(dbPath, { verbose: console.log });

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema (split by semicolons and execute each statement)
    const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

    for (const statement of statements) {
        try {
            db.exec(statement);
        } catch (error) {
            // Ignore errors for statements that already exist
            if (!error.message.includes('already exists')) {
                console.error('Schema error:', error.message);
            }
        }
    }

    console.log('✅ Database initialized successfully');
    console.log(`📁 Database file: ${dbPath}`);

    return db;
}

/**
 * Save database (not needed for SQLite, but kept for compatibility)
 */
function saveDatabase() {
    // SQLite auto-saves, no action needed
}

module.exports = { initializeDatabase, saveDatabase };

