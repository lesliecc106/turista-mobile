require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

console.log('Ì≥° Connecting to database...');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false  // Enable SSL for Railway
    }
});

async function run() {
    try {
        console.log('Ì≥Ñ Running SQL schema...');
        const sql = fs.readFileSync('./server/schema.sql', 'utf8');
        await pool.query(sql);
        console.log('‚úÖ Survey tables created successfully!');
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('‚ùå Error:', error.message);
        process.exit(1);
    }
}

run();
