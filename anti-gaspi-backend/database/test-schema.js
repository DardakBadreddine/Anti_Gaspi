const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function testSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'antigaspi',
        multipleStatements: true // Important for executing multiple statements
    });

    try {
        console.log('📖 Reading schema file...');
        const schemaPath = path.join(__dirname, 'schema-mysql.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('🔧 Executing schema...');
        await connection.query(schema);
        
        console.log('✅ Schema executed successfully!');
        
        // Check if tables exist
        const [tables] = await connection.query('SHOW TABLES');
        console.log('\n📊 Tables created:');
        tables.forEach(table => {
            console.log(`  - ${Object.values(table)[0]}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await connection.end();
    }
}

testSchema();
