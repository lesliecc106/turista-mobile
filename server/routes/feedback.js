const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create feedback table if not exists
const createFeedbackTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS feedback (
                id SERIAL PRIMARY KEY,
                user_id INTEGER,
                user_name VARCHAR(255),
                user_email VARCHAR(255),
                message TEXT NOT NULL,
                reply TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                replied_at TIMESTAMP
            )
        `);
    } catch (error) {
        console.error('Error creating feedback table:', error);
    }
};

createFeedbackTable();

// Get all feedback
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM feedback ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ error: 'Failed to fetch feedback' });
    }
});

// Submit feedback
router.post('/', async (req, res) => {
    try {
        const { userName, userEmail, message } = req.body;
        
        const result = await pool.query(
            'INSERT INTO feedback (user_name, user_email, message) VALUES ($1, $2, $3) RETURNING *',
            [userName, userEmail, message]
        );
        
        res.json({ success: true, feedback: result.rows[0] });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ error: 'Failed to submit feedback' });
    }
});

// Reply to feedback
router.post('/:id/reply', async (req, res) => {
    try {
        const { id } = req.params;
        const { reply } = req.body;
        
        await pool.query(
            'UPDATE feedback SET reply = $1, replied_at = NOW() WHERE id = $2',
            [reply, id]
        );
        
        res.json({ success: true, message: 'Reply sent successfully' });
    } catch (error) {
        console.error('Error replying to feedback:', error);
        res.status(500).json({ error: 'Failed to send reply' });
    }
});

module.exports = router;
