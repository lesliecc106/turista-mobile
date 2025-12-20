const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        await pool.query(sql);
        console.log('✅ Database schema created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating schema:', error);
        process.exit(1);
    }
}

setupDatabase();
