const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config/database');

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = result.rows[0];
        
        // For demo, allow plain text comparison (in production, use bcrypt)
        const validPassword = password === user.password || 
                             await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        if (user.status === 'pending') {
            return res.status(403).json({ error: 'Account pending approval' });
        }
        
        if (user.status === 'rejected') {
            return res.status(403).json({ error: 'Account rejected' });
        }
        
        req.session.user = {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
            email: user.email
        };
        
        res.json({ 
            success: true, 
            user: req.session.user 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Signup
router.post('/register', async (req, res) => {
    try {
        const { username, password, name, email, role } = req.body;
        const bcrypt = require('bcrypt');
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `INSERT INTO users (username, password, name, email, role, status) VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING id`,
            [username, hashedPassword, name, email, role]
        );
        await pool.query(
            `INSERT INTO notifications (username, subject, body) VALUES ('admin01', 'New signup pending', $1)`,
            [\`New account ${username} created and awaiting approval.\`]
        );
        
        res.json({ success: true, message: 'Account created successfully' });
    } catch (error) {
        console.error('Register error:', error);
        if (error.code === '23505') {
            res.status(400).json({ error: 'Username already exists' });
        } else {
            res.status(500).json({ error: 'Registration failed' });
        }
    }
});

router.post('/signup', async (req, res) => {
    try {
        const { username, password, name, email, role } = req.body;
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await pool.query(
            `INSERT INTO users (username, password, name, email, role, status) 
             VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING id`,
            [username, hashedPassword, name, email, role]
        );
        
        // Create notification for admins
        await pool.query(
            `INSERT INTO notifications (username, subject, body)
             VALUES ('admin01', 'New signup pending', $1)`,
            [`New account ${username} created and awaiting approval.`]
        );
        
        res.json({ success: true, message: 'Account created successfully' });
    } catch (error) {
        console.error('Signup error:', error);
        if (error.code === '23505') { // Unique violation
            res.status(400).json({ error: 'Username already exists' });
        } else {
            res.status(500).json({ error: 'Signup failed' });
        }
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Get current session
router.get('/session', (req, res) => {
    if (req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

module.exports = router;
