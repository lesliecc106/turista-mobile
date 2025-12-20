const express = require('express');
const router = express.Router();

// Dashboard Statistics
router.get('/dashboard-stats', requireAuth, async (req, res) => {
    try {
        const username = req.session.user.username;
        const totalResult = await pool.query('SELECT COUNT(*) as count FROM surveys WHERE owner = $1', [username]);
        const accomResult = await pool.query('SELECT COUNT(*) as count FROM surveys WHERE owner = $1 AND survey_type = $2', [username, 'accommodation']);
        const daytripResult = await pool.query('SELECT COUNT(*) as count FROM surveys WHERE owner = $1 AND survey_type = $2', [username, 'daytrip']);
        const visitorsResult = await pool.query('SELECT COALESCE(SUM(CAST(party_size AS INTEGER)), 0) as total FROM surveys WHERE owner = $1', [username]);
        res.json({
            totalSurveys: parseInt(totalResult.rows[0].count),
            accommodationSurveys: parseInt(accomResult.rows[0].count),
            daytripSurveys: parseInt(daytripResult.rows[0].count),
            totalVisitors: parseInt(visitorsResult.rows[0].total)
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

router.get('/chart-data', requireAuth, async (req, res) => {
    try {
        const username = req.session.user.username;
        const monthlyResult = await pool.query(`SELECT TO_CHAR(created_at, 'Mon YYYY') as month, COUNT(*) as count FROM surveys WHERE owner = $1 AND created_at >= NOW() - INTERVAL '6 months' GROUP BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at) ORDER BY DATE_TRUNC('month', created_at)`, [username]);
        const typeResult = await pool.query('SELECT survey_type, COUNT(*) as count FROM surveys WHERE owner = $1 GROUP BY survey_type', [username]);
        const nationalityResult = await pool.query('SELECT origin as nationality, COUNT(*) as count FROM surveys WHERE owner = $1 AND origin IS NOT NULL GROUP BY origin ORDER BY count DESC LIMIT 6', [username]);
        res.json({
            monthlyData: { labels: monthlyResult.rows.map(r => r.month), values: monthlyResult.rows.map(r => parseInt(r.count)) },
            surveyTypes: { accommodation: typeResult.rows.find(r => r.survey_type === 'accommodation')?.count || 0, daytrip: typeResult.rows.find(r => r.survey_type === 'daytrip')?.count || 0 },
            nationalities: { labels: nationalityResult.rows.map(r => r.nationality), values: nationalityResult.rows.map(r => parseInt(r.count)) }
        });
    } catch (error) {
        console.error('Chart data error:', error);
        res.status(500).json({ error: 'Failed to fetch chart data' });
    }
});
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
        // Add safety check
        if (!req.session || !req.session.user || !req.session.user.username) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const username = req.session.user.username;

        // Total surveys
        const attractionCount = await pool.query(
            'SELECT COUNT(*) FROM attraction_surveys WHERE owner = $1',
            [username]
        );
        
        const accommodationCount = await pool.query(
            'SELECT COUNT(*) FROM accommodation_surveys WHERE owner = $1',
            [username]
        );
        
        // Total visitors (from regional distribution)
        const visitorCount = await pool.query(
            'SELECT COALESCE(SUM(count), 0) as sum FROM regional_distribution WHERE owner = $1',
            [username]
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
            [username, username]
        );
        
        // Top nationalities
        const topNationalities = await pool.query(
            `SELECT origin as country, SUM(count) as total
             FROM regional_distribution
             WHERE owner = $1
             GROUP BY origin
             ORDER BY total DESC
             LIMIT 10`,
            [username]
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
        console.error('Error stack:', error.stack);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics', details: error.message });
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

// Get nationalities for a specific attraction survey
router.get('/surveys/attraction/:id/nationalities', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT origin as country, count 
             FROM regional_distribution
             WHERE survey_id = $1 AND survey_type = 'attraction' AND owner = $2
             ORDER BY count DESC`,
            [req.params.id, req.session.user.username]
        );

        res.json({ nationalities: result.rows });
    } catch (error) {
        console.error('Get nationalities error:', error);
        res.status(500).json({ error: 'Failed to fetch nationalities' });
    }
});

// Get nationalities for a specific accommodation survey
router.get('/surveys/accommodation/:id/nationalities', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT origin as country, count 
             FROM regional_distribution
             WHERE survey_id = $1 AND survey_type = 'accommodation' AND owner = $2
             ORDER BY count DESC`,
            [req.params.id, req.session.user.username]
        );

        res.json({ nationalities: result.rows });
    } catch (error) {
        console.error('Get nationalities error:', error);
        res.status(500).json({ error: 'Failed to fetch nationalities' });
    }
});


// Save regional distribution data
router.post('/regional-data/save', requireAuth, async (req, res) => {
    try {
        const { year, distribution, occupancy } = req.body;
        
        if (!distribution || !year) {
            return res.status(400).json({ error: 'Missing required data' });
        }

        // Clear existing data for this user and year
        await pool.query(
            'DELETE FROM regional_distribution WHERE owner = $1 AND EXTRACT(YEAR FROM created_at) = $2',
            [req.session.user.username, year]
        );

        // Insert new distribution data
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
