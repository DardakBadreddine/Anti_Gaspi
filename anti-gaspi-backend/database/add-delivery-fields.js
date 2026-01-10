const Database = require('better-sqlite3');

const db = new Database('./database/antigaspi.db');

console.log('Adding delivery and photo columns to reservations table...');

try {
    const tableInfo = db.prepare("PRAGMA table_info(reservations)").all();

    // Add delivery_option column
    if (!tableInfo.some(col => col.name === 'delivery_option')) {
        db.prepare(`
            ALTER TABLE reservations 
            ADD COLUMN delivery_option TEXT DEFAULT 'pickup' 
            CHECK(delivery_option IN ('pickup', 'morning_delivery', 'evening_delivery'))
        `).run();
        console.log('✅ delivery_option column added');
    } else {
        console.log('⏭️  delivery_option already exists');
    }

    // Add delivery_fee column
    if (!tableInfo.some(col => col.name === 'delivery_fee')) {
        db.prepare('ALTER TABLE reservations ADD COLUMN delivery_fee REAL DEFAULT 0').run();
        console.log('✅ delivery_fee column added');
    } else {
        console.log('⏭️  delivery_fee already exists');
    }

    // Add proof_photo column
    if (!tableInfo.some(col => col.name === 'proof_photo')) {
        db.prepare('ALTER TABLE reservations ADD COLUMN proof_photo TEXT').run();
        console.log('✅ proof_photo column added');
    } else {
        console.log('⏭️  proof_photo already exists');
    }

    console.log('\n✅ All columns added successfully!');
} catch (error) {
    console.error('❌ Error:', error.message);
}

db.close();
