const Database = require('better-sqlite3');

const db = new Database('./database/antigaspi.db');

console.log('Adding profile_photo column to users table...');

try {
    // Check if column exists
    const tableInfo = db.prepare("PRAGMA table_info(users)").all();
    const hasColumn = tableInfo.some(col => col.name === 'profile_photo');
    
    if (!hasColumn) {
        db.prepare('ALTER TABLE users ADD COLUMN profile_photo TEXT').run();
        console.log('✅ profile_photo column added successfully');
    } else {
        console.log('⏭️  profile_photo column already exists');
    }
} catch (error) {
    console.error('❌ Error:', error.message);
}

db.close();
console.log('Done!');
