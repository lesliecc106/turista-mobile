const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all feedback with user details
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT f.*, 
                   u.name as user_name, 
                   u.role as user_role
            FROM feedback f
            LEFT JOIN users u ON f.username = u.username
            ORDER BY f.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Fetch feedback error:', error);
        res.status(500).json({ error: 'Failed to fetch feedback' });
    }
});

// Submit feedback
router.post('/', async (req, res) => {
    try {
        const { username, subject, body } = req.body;
        
        const result = await pool.query(
            'INSERT INTO feedback (username, subject, body) VALUES ($1, $2, $3) RETURNING *',
            [username, subject, body]
        );
        
        // Notify all admins
        const admins = await pool.query("SELECT username FROM users WHERE role = 'admin'");
        for (const admin of admins.rows) {
            await pool.query(
                'INSERT INTO notifications (username, subject, body) VALUES ($1, $2, $3)',
                [admin.username, 'New Feedback', `${username}: ${subject}`]
            );
        }
        
        res.json({ success: true, feedback: result.rows[0] });
    } catch (error) {
        console.error('Submit feedback error:', error);
        res.status(500).json({ error: 'Failed to submit feedback' });
    }
});

// Admin replies to feedback
router.post('/:id/reply', async (req, res) => {
    try {
        const { id } = req.params;
        const { reply } = req.body;
        
        const feedback = await pool.query('SELECT * FROM feedback WHERE id = $1', [id]);
        const originalUser = feedback.rows[0].username;
        
        await pool.query(
            'UPDATE feedback SET reply = $1, reply_date = NOW() WHERE id = $2',
            [reply, id]
        );
        
        // Notify the user
        await pool.query(
            'INSERT INTO notifications (username, subject, body) VALUES ($1, $2, $3)',
            [originalUser, 'Admin replied to your feedback', reply]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Reply error:', error);
        res.status(500).json({ error: 'Failed to send reply' });
    }
});

module.exports = router;

// User replies back to admin's reply
router.post('/:id/reply-back', async (req, res) => {
    try {
        const { id } = req.params;
        const { replyBack, username } = req.body;
        
        // Update feedback with user's reply
        await pool.query(
            'UPDATE feedback SET user_reply_back = $1, user_reply_date = NOW() WHERE id = $2',
            [replyBack, id]
        );
        
        // Notify all admins
        const admins = await pool.query("SELECT username FROM users WHERE role = 'admin' AND status = 'approved'");
        for (const admin of admins.rows) {
            await pool.query(
                'INSERT INTO notifications (username, subject, body) VALUES ($1, $2, $3)',
                [admin.username, 'User replied to feedback', `${username} replied: ${replyBack}`]
            );
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Reply back error:', error);
        res.status(500).json({ error: 'Failed to send reply' });
    }
});
