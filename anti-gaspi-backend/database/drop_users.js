const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'antigaspi.db');
const db = new Database(dbPath, { verbose: console.log });

try {
    console.log('🗑️  Dropping all users and related data...');

    // Enable foreign keys just in case
    db.pragma('foreign_keys = ON');

    // Delete in order of dependency (children first) to avoid constraint errors

    // 1. Reservations (depends on Users and Baskets)
    const deleteReservations = db.prepare('DELETE FROM reservations');
    const infoReservations = deleteReservations.run();
    console.log(`- Deleted ${infoReservations.changes} reservations`);

    // 2. Baskets (depends on Merchants)
    const deleteBaskets = db.prepare('DELETE FROM baskets');
    const infoBaskets = deleteBaskets.run();
    console.log(`- Deleted ${infoBaskets.changes} baskets`);

    // 3. Merchants (depends on Users)
    const deleteMerchants = db.prepare('DELETE FROM merchants');
    const infoMerchants = deleteMerchants.run();
    console.log(`- Deleted ${infoMerchants.changes} merchants`);

    // 4. Users (Parent table)
    const deleteUsers = db.prepare('DELETE FROM users');
    const infoUsers = deleteUsers.run();
    console.log(`- Deleted ${infoUsers.changes} users`);

    console.log('✅ Successfully dropped all users and related data.');
} catch (error) {
    console.error('❌ Error dropping users:', error);
    process.exit(1);
}
