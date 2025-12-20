const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const pool = require('../db');

// One-time migration endpoint
router.get('/run-migrations', async (req, res) => {
    try {
        console.log('Ì¥Ñ Running database migrations...');
        
        const sql = fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf8');
        await pool.query(sql);
        
        console.log('‚úÖ Migrations completed!');
        res.json({ 
            success: true, 
            message: 'Database migrations completed successfully!' 
        });
    } catch (error) {
        console.error('‚ùå Migration error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;
