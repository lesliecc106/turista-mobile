const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config/database');

// Middleware to check admin access
const requireAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// Get Pending Users
router.get('/pending-users', requireAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, username, name, email, role FROM users WHERE status = 'pending'"
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get pending users error:', error);
        res.status(500).json({ error: 'Failed to get pending users' });
    }
});

// Approve User
router.post('/approve-user/:username', requireAdmin, async (req, res) => {
    try {
        await pool.query(
            "UPDATE users SET status = 'approved' WHERE username = $1",
            [req.params.username]
        );
        
        await pool.query(
            `INSERT INTO notifications (username, subject, body)
             VALUES ($1, 'Account approved', 'Your account has been approved by the tourism office.')`,
            [req.params.username]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Approve user error:', error);
        res.status(500).json({ error: 'Failed to approve user' });
    }
});

// Reject User
router.post('/reject-user/:username', requireAdmin, async (req, res) => {
    try {
        await pool.query(
            "UPDATE users SET status = 'rejected' WHERE username = $1",
            [req.params.username]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Reject user error:', error);
        res.status(500).json({ error: 'Failed to reject user' });
    }
});

// Get All Users
router.get('/users', requireAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, username, name, email, role, status, created_at 
             FROM users 
             WHERE username NOT IN ('admin01', 'admin02', 'admin03')
             ORDER BY created_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
});

// Create Establishment
router.post('/create-establishment', requireAdmin, async (req, res) => {
    try {
        const { name, code, owner, password } = req.body;
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await pool.query(
            `INSERT INTO users (username, password, name, role, status)
             VALUES ($1, $2, $3, 'establishment', 'approved')`,
            [code, hashedPassword, owner]
        );
        
        await pool.query(
            `INSERT INTO establishments (name, owner, status)
             VALUES ($1, $2, 'approved')`,
            [name, code]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Create establishment error:', error);
        res.status(500).json({ error: 'Failed to create establishment' });
    }
});

// Get Feedback
router.get('/feedback', requireAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM feedback ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get feedback error:', error);
        res.status(500).json({ error: 'Failed to get feedback' });
    }
});

// Submit Feedback
router.post('/feedback', async (req, res) => {
    try {
        const { name, message } = req.body;
        
        await pool.query(
            'INSERT INTO feedback (from_name, message) VALUES ($1, $2)',
            [name, message]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Submit feedback error:', error);
        res.status(500).json({ error: 'Failed to submit feedback' });
    }
});

// Get Notifications
router.get('/notifications', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        const result = await pool.query(
            'SELECT * FROM notifications WHERE username = $1 ORDER BY created_at DESC',
            [req.session.user.username]
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to get notifications' });
    }
});

// Mark notifications as read
router.post('/notifications/read', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        await pool.query(
            'UPDATE notifications SET is_read = true WHERE username = $1',
            [req.session.user.username]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Mark notifications read error:', error);
        res.status(500).json({ error: 'Failed to mark as read' });
    }
});

module.exports = router;
