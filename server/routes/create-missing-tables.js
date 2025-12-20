const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/run', async (req, res) => {
    try {
        // Create attraction_surveys table if not exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS attraction_surveys (
                id SERIAL PRIMARY KEY,
                survey_date DATE,
                attraction_name VARCHAR(255),
                city VARCHAR(255),
                province VARCHAR(255),
                code VARCHAR(100),
                enumerator VARCHAR(255),
                visit_date DATE,
                residence VARCHAR(255),
                purpose VARCHAR(100),
                transport VARCHAR(100),
                group_size INTEGER,
                stay VARCHAR(50),
                nationality_data JSONB,
                owner VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create accommodation_surveys table if not exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS accommodation_surveys (
                id SERIAL PRIMARY KEY,
                survey_date DATE,
                establishment_name VARCHAR(255),
                ae_type VARCHAR(100),
                num_rooms INTEGER,
                city VARCHAR(255),
                province VARCHAR(255),
                enumerator VARCHAR(255),
                checkin_date DATE,
                checkout_date DATE,
                purpose VARCHAR(100),
                source VARCHAR(255),
                room_nights INTEGER,
                transport VARCHAR(100),
                nationality_data JSONB,
                owner VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create regional_distribution table if not exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS regional_distribution (
                id SERIAL PRIMARY KEY,
                origin VARCHAR(255),
                count INTEGER,
                is_manual BOOLEAN DEFAULT false,
                owner VARCHAR(255),
                survey_type VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create notifications table if not exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255),
                subject VARCHAR(255),
                body TEXT,
                is_read BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create feedback table if not exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS feedback (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255),
                subject VARCHAR(255),
                message TEXT,
                status VARCHAR(50) DEFAULT 'pending',
                reply TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                replied_at TIMESTAMP
            )
        `);

        res.json({ success: true, message: 'All tables created successfully' });
    } catch (error) {
        console.error('Migration error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
