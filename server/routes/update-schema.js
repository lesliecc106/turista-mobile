const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/add-feedback-columns', async (req, res) => {
    try {
        await pool.query(`
            ALTER TABLE feedback 
            ADD COLUMN IF NOT EXISTS user_reply_back TEXT,
            ADD COLUMN IF NOT EXISTS user_reply_date TIMESTAMP
        `);
        res.json({ success: true });
    } catch (error) {
        console.error('Schema update error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
