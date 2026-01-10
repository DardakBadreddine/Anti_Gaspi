const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dbPath = path.join(__dirname, 'database', 'antigaspi.db');

console.log('🗑️  Deleting old database...');
if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('✅ Old database deleted');
} else {
    console.log('ℹ️  No existing database found');
}

console.log('\n📝 Creating fresh database...');
const { initializeDatabase } = require('./database/init');
const db = initializeDatabase(dbPath);

console.log('\n🔄 Running migrations...');
execSync('node database/migration.js', { stdio: 'inherit' });

db.close();

console.log('\n🌱 Seeding database...');
execSync('node database/seed.js', { stdio: 'inherit' });

console.log('\n✅ Database reset complete!');
console.log('You can now restart the backend with: npm start');
