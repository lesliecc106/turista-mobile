const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { requireAuth } = require('../../middleware/auth');

// Attraction Survey
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

        // Add to regional distribution - only if data exists
        if (nationalityRows && Array.isArray(nationalityRows) && nationalityRows.length > 0) {
            for (const row of nationalityRows) {
                await pool.query(
                    `INSERT INTO regional_distribution (origin, count, is_manual, owner)
                     VALUES ($1, $2, false, $3)`,
                    [row.nat, row.count, req.session.user.username]
                );
            }
        }

        res.json({ success: true, id: result.rows[0].id });
    } catch (error) {
        console.error('Attraction survey error:', error);
        res.status(500).json({ error: 'Failed to submit survey. Please try again.' });
    }
});

// Accommodation Survey
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

        // Add to regional distribution - only if data exists
        if (nationalityRows && Array.isArray(nationalityRows) && nationalityRows.length > 0) {
            for (const row of nationalityRows) {
                await pool.query(
                    `INSERT INTO regional_distribution (origin, count, is_manual, owner)
                     VALUES ($1, $2, false, $3)`,
                    [row.nat, row.count, req.session.user.username]
                );
            }
        }

        res.json({ success: true, id: result.rows[0].id });
    } catch (error) {
        console.error('Accommodation survey error:', error);
        res.status(500).json({ error: 'Failed to submit survey. Please try again.' });
    }
});

module.exports = router;
