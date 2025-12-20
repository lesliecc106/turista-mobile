const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get Regional Distribution
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT origin, SUM(count) as total 
             FROM regional_distribution 
             GROUP BY origin 
             ORDER BY total DESC`
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error('Get regional error:', error);
        res.status(500).json({ error: 'Failed to get regional data' });
    }
});

// Add Manual Entry (Admin only)
router.post('/manual', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        const { origin, count } = req.body;
        
        await pool.query(
            `INSERT INTO regional_distribution (origin, count, is_manual, owner)
             VALUES ($1, $2, true, $3)`,
            [origin, count, req.session.user.username]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Add manual regional error:', error);
        res.status(500).json({ error: 'Failed to add entry' });
    }
});

// Get Raw Entries
router.get('/raw', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        const result = await pool.query(
            'SELECT * FROM regional_distribution ORDER BY created_at DESC'
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error('Get raw regional error:', error);
        res.status(500).json({ error: 'Failed to get raw data' });
    }
});

// Delete Entry (Admin only)
router.delete('/:id', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        await pool.query('DELETE FROM regional_distribution WHERE id = $1', [req.params.id]);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Delete regional error:', error);
        res.status(500).json({ error: 'Failed to delete entry' });
    }
});

module.exports = router;
