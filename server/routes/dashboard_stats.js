const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get dashboard statistics
router.get('/dashboard-stats', async (req, res) => {
    try {
        const username = req.session.user.username;
        
        // Total surveys
        const totalResult = await pool.query(
            'SELECT COUNT(*) as count FROM surveys WHERE owner = $1',
            [username]
        );
        
        // Accommodation surveys
        const accomResult = await pool.query(
            'SELECT COUNT(*) as count FROM surveys WHERE owner = $1 AND survey_type = $2',
            [username, 'accommodation']
        );
        
        // Day trip surveys
        const daytripResult = await pool.query(
            'SELECT COUNT(*) as count FROM surveys WHERE owner = $1 AND survey_type = $2',
            [username, 'daytrip']
        );
        
        // Total visitors (sum of party sizes)
        const visitorsResult = await pool.query(
            'SELECT COALESCE(SUM(CAST(party_size AS INTEGER)), 0) as total FROM surveys WHERE owner = $1',
            [username]
        );
        
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

// Get chart data
router.get('/chart-data', async (req, res) => {
    try {
        const username = req.session.user.username;
        
        // Monthly data (last 6 months)
        const monthlyResult = await pool.query(`
            SELECT 
                TO_CHAR(created_at, 'Mon YYYY') as month,
                COUNT(*) as count
            FROM surveys 
            WHERE owner = $1 
                AND created_at >= NOW() - INTERVAL '6 months'
            GROUP BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at)
            ORDER BY DATE_TRUNC('month', created_at)
        `, [username]);
        
        // Survey type distribution
        const typeResult = await pool.query(`
            SELECT 
                survey_type,
                COUNT(*) as count
            FROM surveys 
            WHERE owner = $1
            GROUP BY survey_type
        `, [username]);
        
        // Top nationalities
        const nationalityResult = await pool.query(`
            SELECT 
                origin as nationality,
                COUNT(*) as count
            FROM surveys 
            WHERE owner = $1 AND origin IS NOT NULL
            GROUP BY origin
            ORDER BY count DESC
            LIMIT 6
        `, [username]);
        
        res.json({
            monthlyData: {
                labels: monthlyResult.rows.map(r => r.month),
                values: monthlyResult.rows.map(r => parseInt(r.count))
            },
            surveyTypes: {
                accommodation: typeResult.rows.find(r => r.survey_type === 'accommodation')?.count || 0,
                daytrip: typeResult.rows.find(r => r.survey_type === 'daytrip')?.count || 0
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
