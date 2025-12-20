const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

// Dashboard Statistics - FIXED to use correct table names
router.get('/dashboard-stats', requireAuth, async (req, res) => {
    try {
        const username = req.session.user.username;
        
        // Get attraction surveys count
        const attractionResult = await pool.query(
            'SELECT COUNT(*) as count FROM attraction_surveys WHERE owner = $1', 
            [username]
        );
        
        // Get accommodation surveys count
        const accomResult = await pool.query(
            'SELECT COUNT(*) as count FROM accommodation_surveys WHERE owner = $1', 
            [username]
        );
        
        // Calculate total surveys
        const totalSurveys = parseInt(attractionResult.rows[0].count) + parseInt(accomResult.rows[0].count);
        
        // Get total visitors from both tables
        const attractionVisitors = await pool.query(
            'SELECT COALESCE(SUM(CAST(party_size AS INTEGER)), 0) as total FROM attraction_surveys WHERE owner = $1', 
            [username]
        );
        
        const accomVisitors = await pool.query(
            'SELECT COALESCE(SUM(CAST(party_size AS INTEGER)), 0) as total FROM accommodation_surveys WHERE owner = $1', 
            [username]
        );
        
        const totalVisitors = parseInt(attractionVisitors.rows[0].total) + parseInt(accomVisitors.rows[0].total);
        
        res.json({
            totalSurveys: totalSurveys,
            accommodationSurveys: parseInt(accomResult.rows[0].count),
            daytripSurveys: parseInt(attractionResult.rows[0].count), // Using attraction as daytrip
            totalVisitors: totalVisitors
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

// Chart Data - FIXED to use correct table names
router.get('/chart-data', requireAuth, async (req, res) => {
    try {
        const username = req.session.user.username;
        
        // Get monthly data from both tables
        const monthlyQuery = `
            SELECT TO_CHAR(created_at, 'Mon YYYY') as month, COUNT(*) as count,
                   DATE_TRUNC('month', created_at) as month_date
            FROM (
                SELECT created_at FROM attraction_surveys WHERE owner = $1
                UNION ALL
                SELECT created_at FROM accommodation_surveys WHERE owner = $1
            ) combined
            WHERE created_at >= NOW() - INTERVAL '6 months'
            GROUP BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at)
            ORDER BY DATE_TRUNC('month', created_at)
        `;
        
        const monthlyResult = await pool.query(monthlyQuery, [username]);
        
        // Get survey type counts
        const attractionCount = await pool.query(
            'SELECT COUNT(*) as count FROM attraction_surveys WHERE owner = $1',
            [username]
        );
        
        const accommodationCount = await pool.query(
            'SELECT COUNT(*) as count FROM accommodation_surveys WHERE owner = $1',
            [username]
        );
        
        // Get nationality data from regional_distribution table
        const nationalityResult = await pool.query(
            `SELECT origin as nationality, SUM(count) as count 
             FROM regional_distribution 
             WHERE owner = $1 AND origin IS NOT NULL 
             GROUP BY origin 
             ORDER BY count DESC 
             LIMIT 6`,
            [username]
        );
        
        res.json({
            monthlyData: {
                labels: monthlyResult.rows.map(r => r.month),
                values: monthlyResult.rows.map(r => parseInt(r.count))
            },
            surveyTypes: {
                accommodation: parseInt(accommodationCount.rows[0].count),
                daytrip: parseInt(attractionCount.rows[0].count)
            },
            nationalities: {
                labels: nationalityResult.rows.map(r => r.nationality),
                values: nationalityResult.rows.map(r => parseInt(r.count))
            }
        });
    } catch (error) {
        console.error('Chart data error:', error);
        res.status(500).json({ error: 'Failed to fetch chart data' });
    }
});

// Get survey history (all submitted surveys)
router.get('/history', requireAuth, async (req, res) => {
    try {
        const attractionSurveys = await pool.query(
            `SELECT id, survey_date, attraction_name as name, 'Attraction' as type,
                    enumerator, created_at
             FROM attraction_surveys
             WHERE owner = $1
             ORDER BY created_at DESC`,
            [req.session.user.username]
        );

        const accommodationSurveys = await pool.query(
            `SELECT id, survey_date, establishment_name as name, 'Accommodation' as type,
                    enumerator, created_at
             FROM accommodation_surveys
             WHERE owner = $1
             ORDER BY created_at DESC`,
            [req.session.user.username]
        );

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

// Get regional distribution data
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

// Get regional distribution report
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

// Save regional distribution data
router.post('/regional-data/save', requireAuth, async (req, res) => {
    try {
        const { year, distribution } = req.body;

        if (!distribution || !year) {
            return res.status(400).json({ error: 'Missing required data' });
        }

        await pool.query(
            'DELETE FROM regional_distribution WHERE owner = $1 AND EXTRACT(YEAR FROM created_at) = $2',
            [req.session.user.username, year]
        );

        for (const [country, months] of Object.entries(distribution)) {
            for (const [month, count] of Object.entries(months)) {
                if (count > 0) {
                    await pool.query(
                        `INSERT INTO regional_distribution (origin, count, survey_type, owner, created_at)
                         VALUES ($1, $2, 'manual', $3, TO_DATE($4 || '-' || $5, 'YYYY-MM'))`,
                        [country, count, req.session.user.username, year, month]
                    );
                }
            }
        }

        res.json({ success: true, message: 'Regional data saved successfully' });
    } catch (error) {
        console.error('Save regional data error:', error);
        res.status(500).json({ error: 'Failed to save regional data' });
    }
});

module.exports = router;
