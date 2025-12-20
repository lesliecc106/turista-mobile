const express = require('express');
const router = express.Router();
const pool = require('../db');

// Migration endpoint to add missing columns
router.post('/add-user-columns', async (req, res) => {
    try {
        // Add name column if it doesn't exist
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS name VARCHAR(255)
        `);
        
        // Add role column if it doesn't exist
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'tourist'
        `);
        
        // Add status column if it doesn't exist
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'approved'
        `);
        
        console.log('✅ Migration successful: Added name, role, status columns');
        res.json({ success: true, message: 'Database migrated successfully' });
    } catch (error) {
        console.error('Migration error:', error);
        res.status(500).json({ error: 'Migration failed' });
    }
});

module.exports = router;
