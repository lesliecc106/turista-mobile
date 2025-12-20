const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { requireAuth } = require('../middleware/auth');

// Get survey history (all submitted surveys)
router.get('/history', requireAuth, async (req, res) => {
    try {
        // Get attraction surveys
        const attractionSurveys = await pool.query(
            `SELECT id, survey_date, attraction_name as name, 'Attraction' as type, 
                    enumerator, created_at
             FROM attraction_surveys 
             WHERE owner = $1
             ORDER BY created_at DESC`,
            [req.session.user.username]
        );

        // Get accommodation surveys
        const accommodationSurveys = await pool.query(
            `SELECT id, survey_date, establishment_name as name, 'Accommodation' as type,
                    enumerator, created_at
             FROM accommodation_surveys 
             WHERE owner = $1
             ORDER BY created_at DESC`,
            [req.session.user.username]
        );

        // Combine and sort by date
        const allSurveys = [
            ...attractionSurveys.rows,
            ...accommodationSurveys.rows
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        res.json({ surveys: allSurveys });
    } catch (error) {
        console.error('History error:', error);
        res.status(500).json({ error: 'Failed to fetch survey history' });
    }
});

// Get regional distribution data (aggregated by country)
router.get('/regional-data', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT origin as country, SUM(count) as total_count
             FROM regional_distribution
             WHERE owner = $1
             GROUP BY origin
             ORDER BY total_count DESC`,
            [req.session.user.username]
        );

        res.json({ data: result.rows });
    } catch (error) {
        console.error('Regional data error:', error);
        res.status(500).json({ error: 'Failed to fetch regional data' });
    }
});

// Get dashboard statistics
router.get('/dashboard/stats', requireAuth, async (req, res) => {
    try {
        // Total surveys
        const attractionCount = await pool.query(
            'SELECT COUNT(*) FROM attraction_surveys WHERE owner = $1',
            [req.session.user.username]
        );
        const accommodationCount = await pool.query(
            'SELECT COUNT(*) FROM accommodation_surveys WHERE owner = $1',
            [req.session.user.username]
        );

        // Total visitors (from regional distribution)
        const visitorCount = await pool.query(
            'SELECT SUM(count) FROM regional_distribution WHERE owner = $1',
            [req.session.user.username]
        );

        // Monthly breakdown
        const monthlyData = await pool.query(
            `SELECT 
                TO_CHAR(survey_date, 'YYYY-MM') as month,
                COUNT(*) as count
             FROM (
                SELECT survey_date FROM attraction_surveys WHERE owner = $1
                UNION ALL
                SELECT survey_date FROM accommodation_surveys WHERE owner = $1
             ) surveys
             GROUP BY month
             ORDER BY month DESC
             LIMIT 12`,
            [req.session.user.username, req.session.user.username]
        );

        // Top nationalities
        const topNationalities = await pool.query(
            `SELECT origin as country, SUM(count) as total
             FROM regional_distribution
             WHERE owner = $1
             GROUP BY origin
             ORDER BY total DESC
             LIMIT 10`,
            [req.session.user.username]
        );

        res.json({
            totalSurveys: parseInt(attractionCount.rows[0].count) + parseInt(accommodationCount.rows[0].count),
            attractionSurveys: parseInt(attractionCount.rows[0].count),
            accommodationSurveys: parseInt(accommodationCount.rows[0].count),
            totalVisitors: parseInt(visitorCount.rows[0].sum || 0),
            monthlyData: monthlyData.rows,
            topNationalities: topNationalities.rows
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
});

// Get regional distribution report data (for Excel export)
router.get('/reports/regional-distribution', requireAuth, async (req, res) => {
    try {
        const year = req.query.year || new Date().getFullYear();
        
        const result = await pool.query(
            `SELECT 
                origin as country,
                EXTRACT(MONTH FROM created_at) as month,
                SUM(count) as count
             FROM regional_distribution
             WHERE owner = $1 
               AND EXTRACT(YEAR FROM created_at) = $2
             GROUP BY origin, month
             ORDER BY country, month`,
            [req.session.user.username, year]
        );

        res.json({ 
            year: year,
            data: result.rows 
        });
    } catch (error) {
        console.error('Regional distribution report error:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

module.exports = router;
