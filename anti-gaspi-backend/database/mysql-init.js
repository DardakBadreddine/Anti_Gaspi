const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

/**
 * Create MySQL connection pool
 * @param {Object} config - MySQL configuration
 * @returns {Promise<mysql.Pool>} MySQL connection pool
 */
async function createConnectionPool(config) {
    const pool = mysql.createPool({
        host: config.host || process.env.DB_HOST || 'localhost',
        port: config.port || process.env.DB_PORT || 3306,
        user: config.user || process.env.DB_USER || 'root',
        password: config.password || process.env.DB_PASSWORD || '',
        database: config.database || process.env.DB_NAME || 'antigaspi',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        charset: 'utf8mb4',
        multipleStatements: true // Important for executing multiple statements
    });

    // Test connection
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        console.log('✅ MySQL connection established');
    } catch (error) {
        console.error('❌ MySQL connection error:', error.message);
        throw error;
    }

    return pool;
}

/**
 * Initialize MySQL database with schema
 * @param {Object} config - MySQL configuration
 * @returns {Promise<mysql.Pool>} MySQL connection pool
 */
async function initializeDatabase(config = {}) {
    // Create connection pool
    const pool = await createConnectionPool(config);

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema-mysql.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    const connection = await pool.getConnection();
    
    try {
        // Execute entire schema at once (MySQL supports multiple statements)
        console.log('📖 Executing database schema...');
        await connection.query(schema);
        console.log('✅ Schema executed successfully');
        
        // Verify tables were created
        const [tables] = await connection.query('SHOW TABLES');
        if (tables.length > 0) {
            console.log(`✅ Created ${tables.length} tables`);
        } else {
            console.warn('⚠️  No tables found after schema execution');
        }

        // Run migrations to ensure new columns exist
        await runMigrations(connection);

        // Insert default categories
        await insertDefaultCategories(connection);

        console.log('✅ Database schema initialized successfully');
    } catch (error) {
        console.error('❌ Database initialization error:', error);
        throw error;
    } finally {
        connection.release();
    }

    return pool;
}

/**
 * Run database migrations
 */
async function runMigrations(connection) {
    try {
        // Add image_url column to baskets if it doesn't exist, or migrate to LONGTEXT
        try {
            await connection.execute('ALTER TABLE baskets ADD COLUMN image_url LONGTEXT');
            console.log('✅ Added image_url column to baskets');
        } catch (error) {
            if (error.message.includes('Duplicate column name')) {
                // Column exists, try to migrate to LONGTEXT
                try {
                    await connection.execute('ALTER TABLE baskets MODIFY COLUMN image_url LONGTEXT');
                    console.log('✅ Migrated baskets.image_url to LONGTEXT');
                } catch (migrateError) {
                    // Already LONGTEXT or other error
                }
            } else {
                console.log('ℹ️  image_url column check:', error.message);
            }
        }

        // Add auto_relist column to baskets if it doesn't exist
        try {
            await connection.execute('ALTER TABLE baskets ADD COLUMN auto_relist TINYINT(1) DEFAULT 0');
            console.log('✅ Added auto_relist column to baskets');
        } catch (error) {
            if (!error.message.includes('Duplicate column name')) {
                console.log('ℹ️  auto_relist column check:', error.message);
            }
        }

        // Add rating column to baskets if it doesn't exist
        try {
            await connection.execute('ALTER TABLE baskets ADD COLUMN rating DECIMAL(3, 2) DEFAULT 0');
            console.log('✅ Added rating column to baskets');
        } catch (error) {
            if (!error.message.includes('Duplicate column name')) {
                console.log('ℹ️  rating column check:', error.message);
            }
        }

        // Add cover_image_url column to merchants if it doesn't exist, or migrate to LONGTEXT
        try {
            await connection.execute('ALTER TABLE merchants ADD COLUMN cover_image_url LONGTEXT');
            console.log('✅ Added cover_image_url column to merchants');
        } catch (error) {
            if (error.message.includes('Duplicate column name')) {
                // Column exists, try to migrate to LONGTEXT
                try {
                    await connection.execute('ALTER TABLE merchants MODIFY COLUMN cover_image_url LONGTEXT');
                    console.log('✅ Migrated merchants.cover_image_url to LONGTEXT');
                } catch (migrateError) {
                    // Already LONGTEXT or other error
                }
            } else {
                console.log('ℹ️  cover_image_url column check:', error.message);
            }
        }

        // Add profile_image_url column to users if it doesn't exist, or migrate to LONGTEXT
        try {
            await connection.execute('ALTER TABLE users ADD COLUMN profile_image_url LONGTEXT');
            console.log('✅ Added profile_image_url column to users');
        } catch (error) {
            if (error.message.includes('Duplicate column name')) {
                // Column exists, try to migrate to LONGTEXT
                try {
                    await connection.execute('ALTER TABLE users MODIFY COLUMN profile_image_url LONGTEXT');
                    console.log('✅ Migrated users.profile_image_url to LONGTEXT');
                } catch (migrateError) {
                    // Already LONGTEXT or other error
                }
            } else {
                console.log('ℹ️  profile_image_url column check:', error.message);
            }
        }
        
        // Migrate merchants.logo_url to LONGTEXT if it exists
        try {
            await connection.execute('ALTER TABLE merchants MODIFY COLUMN logo_url LONGTEXT');
            console.log('✅ Migrated merchants.logo_url to LONGTEXT');
        } catch (error) {
            // Column might not exist or already LONGTEXT
        }

        // Add phone column to users if it doesn't exist
        try {
            await connection.execute('ALTER TABLE users ADD COLUMN phone VARCHAR(20)');
            console.log('✅ Added phone column to users');
        } catch (error) {
            if (!error.message.includes('Duplicate column name')) {
                console.log('ℹ️  phone column check:', error.message);
            }
        }

        // Add basket_rating column to reviews if it doesn't exist
        try {
            await connection.execute('ALTER TABLE reviews ADD COLUMN basket_rating INT CHECK (basket_rating >= 1 AND basket_rating <= 5)');
            console.log('✅ Added basket_rating column to reviews');
        } catch (error) {
            if (!error.message.includes('Duplicate column name')) {
                console.log('ℹ️  basket_rating column check:', error.message);
            }
        }

        console.log('✅ Migrations completed');
    } catch (error) {
        console.log('ℹ️  Migration check:', error.message);
    }
}

/**
 * Insert default categories
 */
async function insertDefaultCategories(connection) {
    const categories = [
        { name: 'Boulangerie', icon: '🥖', color: '#FFB84D' },
        { name: 'Restaurant', icon: '🍽️', color: '#FF6B6B' },
        { name: 'Supermarket', icon: '🛒', color: '#4ECDC4' },
        { name: 'Pâtisserie', icon: '🍰', color: '#FFE66D' },
        { name: 'Fruits & Légumes', icon: '🥬', color: '#95E1D3' },
        { name: 'Boucherie', icon: '🥩', color: '#F38181' },
        { name: 'Poissonnerie', icon: '🐟', color: '#AAE3E2' },
        { name: 'Épicerie', icon: '🛍️', color: '#FFD93D' },
    ];

    const insertCategory = 'INSERT IGNORE INTO categories (name, icon, color) VALUES (?, ?, ?)';

    for (const category of categories) {
        try {
            await connection.execute(insertCategory, [category.name, category.icon, category.color]);
        } catch (error) {
            // Ignore duplicate errors
        }
    }
    console.log('✅ Default categories inserted');
}

/**
 * MySQL Database Wrapper to mimic better-sqlite3 API
 * IMPORTANT: Routes must be updated to use async/await
 * because MySQL is asynchronous while better-sqlite3 is synchronous
 */
class MySQLWrapper {
    constructor(pool) {
        this.pool = pool;
    }

    /**
     * Prepare a statement (returns a prepared statement object)
     */
    prepare(query) {
        return new PreparedStatement(this.pool, query);
    }

    /**
     * Execute a query directly (for DDL statements)
     * Returns a promise - routes must use await
     */
    async exec(query) {
        const connection = await this.pool.getConnection();
        try {
            await connection.query(query);
        } finally {
            connection.release();
        }
    }

    /**
     * Pragma (MySQL doesn't need this, but for compatibility)
     */
    pragma(setting) {
        if (setting === 'foreign_keys = ON') {
            // MySQL has foreign keys enabled by default with InnoDB
            return;
        }
    }

    /**
     * Execute a transaction
     * @param {Function} callback - Function that receives a transaction db object
     * @returns {Promise} Result of the callback
     */
    async transaction(callback) {
        const connection = await this.pool.getConnection();
        await connection.beginTransaction();
        
        try {
            // Create a transaction wrapper that uses the same connection
            const transactionDb = {
                prepare: (query) => {
                    return new PreparedStatement(this.pool, query, connection);
                }
            };
            
            const result = await callback(transactionDb);
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Close the connection pool
     */
    async close() {
        await this.pool.end();
    }
}

/**
 * Prepared Statement wrapper
 * All methods return promises - routes must use async/await
 */
class PreparedStatement {
    constructor(pool, query, connection = null) {
        this.pool = pool;
        this.query = query;
        this.connection = connection; // Use specific connection for transactions
    }

    /**
     * Get a single row
     * Returns a promise - use: await db.prepare(...).get(...)
     */
    async get(...params) {
        const executor = this.connection || this.pool;
        // Convert undefined to null for MySQL compatibility
        const cleanParams = params.map(p => p === undefined ? null : p);
        const [rows] = await executor.execute(this.query, cleanParams);
        return rows[0] || null;
    }

    /**
     * Get all rows
     * Returns a promise - use: await db.prepare(...).all(...)
     */
    async all(...params) {
        const executor = this.connection || this.pool;
        // Convert undefined to null for MySQL compatibility
        const cleanParams = params.map(p => p === undefined ? null : p);
        const [rows] = await executor.execute(this.query, cleanParams);
        return rows;
    }

    /**
     * Execute and return result info
     * Returns a promise - use: await db.prepare(...).run(...)
     */
    async run(...params) {
        const executor = this.connection || this.pool;
        // Convert undefined to null for MySQL compatibility
        const cleanParams = params.map(p => p === undefined ? null : p);
        const [result] = await executor.execute(this.query, cleanParams);
        return {
            changes: result.affectedRows,
            lastInsertRowid: result.insertId
        };
    }
}

module.exports = { 
    initializeDatabase, 
    createConnectionPool,
    MySQLWrapper 
};
