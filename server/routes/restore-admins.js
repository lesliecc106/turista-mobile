const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

router.post('/restore-admins', async (req, res) => {
    try {
        const admins = [
            { username: 'admin01', email: 'admin01@turista.com', password: 'admin123', name: 'Admin 01' },
            { username: 'admin02', email: 'admin02@turista.com', password: 'admin456', name: 'Admin 02' },
            { username: 'admin03', email: 'admin03@turista.com', password: 'admin789', name: 'Admin 03' }
        ];
        
        for (const admin of admins) {
            const hashedPassword = await bcrypt.hash(admin.password, 10);
            await pool.query(`
                INSERT INTO users (username, email, password, name, role, status)
                VALUES ($1, $2, $3, $4, 'admin', 'approved')
                ON CONFLICT (username) DO NOTHING
            `, [admin.username, admin.email, hashedPassword, admin.name]);
        }
        
        console.log('✅ All 3 admin accounts restored');
        res.json({ 
            success: true, 
            message: 'Admin accounts restored',
            admins: admins.map(a => ({ username: a.username, password: a.password }))
        });
    } catch (error) {
        console.error('Restore admins error:', error);
        res.status(500).json({ error: 'Failed to restore admins' });
    }
});

module.exports = router;
