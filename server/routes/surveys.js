const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Middleware to check authentication
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    next();
};

// Submit Attraction Survey
router.post('/attraction', requireAuth, async (req, res) => {
    try {
        const {
            surveyDate, attractionName, city, province, code, enumerator,
            visitDate, residence, purpose, transport, groupSize, stay,
            nationalityRows
        } = req.body;
        
        const result = await pool.query(
            `INSERT INTO attraction_surveys 
             (survey_date, attraction_name, city, province, code, enumerator,
              visit_date, residence, purpose, transport, group_size, stay,
              nationality_data, owner)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
             RETURNING id`,
            [surveyDate, attractionName, city, province, code, enumerator,
             visitDate, residence, purpose, transport, groupSize, stay,
             JSON.stringify(nationalityRows || []), req.session.user.username]
        );
        
        // Add to regional distribution
        for (const row of nationalityRows) {
            await pool.query(
                `INSERT INTO regional_distribution (origin, count, is_manual, owner)
                 VALUES ($1, $2, false, $3)`,
                [row.nat, row.count, req.session.user.username]
            );
        }
        
        res.json({ success: true, id: result.rows[0].id });
    } catch (error) {
        console.error('Submit attraction error:', error);
        res.status(500).json({ error: 'Failed to submit survey' });
    }
});

// Submit Accommodation Survey
router.post('/accommodation', requireAuth, async (req, res) => {
    try {
        const {
            surveyDate, establishmentName, aeType, numRooms, city, province,
            enumerator, checkinDate, checkoutDate, purpose, source,
            roomNights, transport, nationalityRows
        } = req.body;
        
        const result = await pool.query(
            `INSERT INTO accommodation_surveys 
             (survey_date, establishment_name, ae_type, num_rooms, city, province,
              enumerator, checkin_date, checkout_date, purpose, source,
              room_nights, transport, nationality_data, owner)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
             RETURNING id`,
            [surveyDate, establishmentName, aeType, numRooms, city, province,
             enumerator, checkinDate, checkoutDate, purpose, source,
             roomNights, transport, JSON.stringify(nationalityRows || []), req.session.user.username]
        );
        
        // Add to regional distribution
        for (const row of nationalityRows) {
            await pool.query(
                `INSERT INTO regional_distribution (origin, count, is_manual, owner)
                 VALUES ($1, $2, false, $3)`,
                [row.nat, row.count, req.session.user.username]
            );
        }
        
        res.json({ success: true, id: result.rows[0].id });
    } catch (error) {
        console.error('Submit accommodation error:', error);
        res.status(500).json({ error: 'Failed to submit survey' });
    }
});

// Get Stats
router.get('/stats', async (req, res) => {
    try {
        const establishments = await pool.query(
            "SELECT COUNT(*) FROM establishments WHERE status = 'approved'"
        );
        const attractions = await pool.query('SELECT COUNT(*) FROM attraction_surveys');
        const accommodations = await pool.query('SELECT COUNT(*) FROM accommodation_surveys');
        const regional = await pool.query('SELECT SUM(count) FROM regional_distribution');
        
        res.json({
            establishments: parseInt(establishments.rows[0].count),
            surveys: parseInt(attractions.rows[0].count) + parseInt(accommodations.rows[0].count),
            regional: parseInt(regional.rows[0].sum || 0)
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

// Get History
router.get('/history/:type', requireAuth, async (req, res) => {
    try {
        const { type } = req.params;
        let result;
        
        if (type === 'attractions') {
            result = await pool.query(
                'SELECT * FROM attraction_surveys ORDER BY created_at DESC LIMIT 50'
            );
        } else if (type === 'accommodations') {
            result = await pool.query(
                'SELECT * FROM accommodation_surveys ORDER BY created_at DESC LIMIT 50'
            );
        } else if (type === 'regional') {
            result = await pool.query(
                'SELECT * FROM regional_distribution ORDER BY created_at DESC LIMIT 50'
            );
        } else {
            return res.status(400).json({ error: 'Invalid type' });
        }
        
        res.json(result.rows);
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Failed to get history' });
    }
});

module.exports = router;
