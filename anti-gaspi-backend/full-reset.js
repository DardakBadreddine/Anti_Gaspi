const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dbPath = path.join(__dirname, 'database', 'antigaspi.db');

console.log('🔄 Full database reset...\n');

// Step 1: Delete database
console.log('1️⃣ Deleting old database...');
if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('   ✅ Deleted\n');
} else {
    console.log('   ℹ️  No existing database\n');
}

// Step 2: Create fresh database
console.log('2️⃣ Creating fresh database...');
const { initializeDatabase } = require('./database/init');
const db = initializeDatabase(dbPath);
db.close();
console.log('   ✅ Created\n');

// Step 3: Seed database
console.log('3️⃣ Seeding with test data...');
execSync('node database/seed.js', { stdio: 'inherit' });

console.log('\n✅ Database fully reset!');
console.log('\n📋 Test Accounts:');
console.log('   Customer: client@test.com / password123');
console.log('   Merchant: merchant@test.com / password123\n');
