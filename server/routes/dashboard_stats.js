const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get dashboard statistics
router.get('/dashboard-stats', async (req, res) => {
    try {
        const username = req.session.user.username;

        // Attraction surveys count
        const attractionResult = await pool.query(
            'SELECT COUNT(*) as count FROM attraction_surveys WHERE owner = $1',
            [username]
        );

        // Accommodation surveys count
        const accomResult = await pool.query(
            'SELECT COUNT(*) as count FROM accommodation_surveys WHERE owner = $1',
            [username]
        );

        const totalSurveys = parseInt(attractionResult.rows[0].count) + parseInt(accomResult.rows[0].count);

        // Total visitors from group_size
        const attractionVisitors = await pool.query(
            'SELECT COALESCE(SUM(CAST(group_size AS INTEGER)), 0) as total FROM attraction_surveys WHERE owner = $1',
            [username]
        );

        const totalVisitors = parseInt(attractionVisitors.rows[0].total) + parseInt(accomResult.rows[0].count);

        res.json({
            totalSurveys: totalSurveys,
            accommodationSurveys: parseInt(accomResult.rows[0].count),
            attractionSurveys: parseInt(attractionResult.rows[0].count),
            totalVisitors: totalVisitors
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

// Get chart data
router.get('/chart-data', async (req, res) => {
    try {
        const username = req.session.user.username;

        // Monthly data (last 6 months)
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

        const attractionCount = await pool.query(
            'SELECT COUNT(*) as count FROM attraction_surveys WHERE owner = $1',
            [username]
        );

        const accommodationCount = await pool.query(
            'SELECT COUNT(*) as count FROM accommodation_surveys WHERE owner = $1',
            [username]
        );

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

module.exports = router;
