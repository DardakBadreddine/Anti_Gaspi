const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'antigaspi.db');
const db = new Database(dbPath, { verbose: console.log });

console.log('🔄 Running migration: Add image_url to baskets...');

try {
    // Check if column already exists
    const tableInfo = db.prepare("PRAGMA table_info(baskets)").all();
    const hasImageUrl = tableInfo.some(col => col.name === 'image_url');

    if (hasImageUrl) {
        console.log('ℹ️  Column image_url already exists');
    } else {
        // Add the column
        db.prepare('ALTER TABLE baskets ADD COLUMN image_url TEXT').run();
        console.log('✅ Added image_url column to baskets table');
    }

    console.log('✅ Migration completed successfully');
} catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
} finally {
    db.close();
}
