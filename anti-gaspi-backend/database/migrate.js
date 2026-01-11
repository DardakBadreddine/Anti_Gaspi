const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'antigaspi.db');
const db = new Database(dbPath, { verbose: console.log });

console.log('🔄 Migrating database schema...');

try {
    // Add visible column to baskets table if it doesn't exist
    try {
        db.prepare('ALTER TABLE baskets ADD COLUMN visible BOOLEAN DEFAULT 1').run();
        console.log('✅ Added visible column to baskets table');
    } catch (error) {
        if (error.message.includes('duplicate column')) {
            console.log('ℹ️  visible column already exists');
        } else {
            throw error;
        }
    }

    // Add logo_url column to merchants table if it doesn't exist
    try {
        db.prepare('ALTER TABLE merchants ADD COLUMN logo_url TEXT').run();
        console.log('✅ Added logo_url column to merchants table');
    } catch (error) {
        if (error.message.includes('duplicate column')) {
            console.log('ℹ️  logo_url column already exists');
        } else {
            throw error;
        }
    }

    // Add rating column to merchants table if it doesn't exist
    try {
        db.prepare('ALTER TABLE merchants ADD COLUMN rating REAL DEFAULT 0').run();
        console.log('✅ Added rating column to merchants table');
    } catch (error) {
        if (error.message.includes('duplicate column')) {
            console.log('ℹ️  rating column already exists');
        } else {
            throw error;
        }
    }

    // Add tagline column to merchants table if it doesn't exist
    try {
        db.prepare('ALTER TABLE merchants ADD COLUMN tagline TEXT').run();
        console.log('✅ Added tagline column to merchants table');
    } catch (error) {
        if (error.message.includes('duplicate column')) {
            console.log('ℹ️  tagline column already exists');
        } else {
            throw error;
        }
    }

    console.log('✅ Database migration complete!');
} catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
}

db.close();
