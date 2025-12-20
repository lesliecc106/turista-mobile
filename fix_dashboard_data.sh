#!/bin/bash

echo "��� FIXING DASHBOARD - Icons, Data & Charts"
echo "=========================================="

# 1. Fix the accommodation icon color for light mode
echo ""
echo "1️⃣ Fixing accommodation icon visibility..."
sed -i '/<div class="stat-card">/,/<\/div>/ {
    /<i class="fas fa-bed"><\/i>/ {
        s/<i class="fas fa-bed"><\/i>/<i class="fas fa-bed" style="color: #10b981;"><\/i>/
    }
}' public/dashboard.html

# 2. Update dashboard.js to fetch and display REAL data
cat > public/js/dashboard.js << 'DASHBOARD_JS'
document.addEventListener('DOMContentLoaded', async () => {
    await loadDashboardData();
    await loadCharts();
});

async function loadDashboardData() {
    try {
        const response = await fetch('/api/analytics/dashboard-stats');
        if (!response.ok) throw new Error('Failed to fetch dashboard stats');
        
        const data = await response.json();
        
        // Update stat cards with real data
        document.querySelector('.stat-card:nth-child(1) .stat-number').textContent = data.totalSurveys || 0;
        document.querySelector('.stat-card:nth-child(2) .stat-number').textContent = data.accommodationSurveys || 0;
        document.querySelector('.stat-card:nth-child(3) .stat-number').textContent = data.daytripSurveys || 0;
        document.querySelector('.stat-card:nth-child(4) .stat-number').textContent = data.totalVisitors || 0;
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

async function loadCharts() {
    try {
        const response = await fetch('/api/analytics/chart-data');
        if (!response.ok) throw new Error('Failed to fetch chart data');
        
        const data = await response.json();
        
        // Create Monthly Trend Chart (Bar Chart)
        createMonthlyChart(data.monthlyData);
        
        // Create Survey Type Distribution (Pie Chart)
        createSurveyTypePie(data.surveyTypes);
        
        // Create Nationality Distribution (Pie Chart)
        createNationalityPie(data.nationalities);
        
    } catch (error) {
        console.error('Error loading charts:', error);
    }
}

function createMonthlyChart(monthlyData) {
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthlyData.labels,
            datasets: [{
                label: 'Surveys per Month',
                data: monthlyData.values,
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Monthly Survey Collection',
                    font: { size: 16, weight: 'bold' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

function createSurveyTypePie(surveyTypes) {
    const ctx = document.getElementById('surveyTypePie').getContext('2d');
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Accommodation', 'Day Trip'],
            datasets: [{
                data: [surveyTypes.accommodation, surveyTypes.daytrip],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(59, 130, 246, 0.8)'
                ],
                borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(59, 130, 246, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Survey Type Distribution',
                    font: { size: 16, weight: 'bold' }
                }
            }
        }
    });
}

function createNationalityPie(nationalities) {
    const ctx = document.getElementById('nationalityPie').getContext('2d');
    
    const colors = [
        'rgba(239, 68, 68, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(234, 179, 8, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)'
    ];
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: nationalities.labels,
            datasets: [{
                data: nationalities.values,
                backgroundColor: colors.slice(0, nationalities.labels.length),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 15,
                        padding: 10
                    }
                },
                title: {
                    display: true,
                    text: 'Top Nationalities',
                    font: { size: 16, weight: 'bold' }
                }
            }
        }
    });
}
DASHBOARD_JS

# 3. Update dashboard.html to include chart containers
echo ""
echo "2️⃣ Adding charts section to dashboard..."

# Add charts section before closing main tag
sed -i '/<\/main>/i\
    <!-- Charts Section -->\
    <div class="charts-container" style="margin-top: 2rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem;">\
        <!-- Monthly Trend Chart -->\
        <div class="chart-card" style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">\
            <canvas id="monthlyChart" style="height: 300px;"></canvas>\
        </div>\
        \
        <!-- Survey Type Pie Chart -->\
        <div class="chart-card" style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">\
            <canvas id="surveyTypePie" style="height: 300px;"></canvas>\
        </div>\
        \
        <!-- Nationality Distribution Chart -->\
        <div class="chart-card" style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">\
            <canvas id="nationalityPie" style="height: 300px;"></canvas>\
        </div>\
    </div>' public/dashboard.html

# 4. Add Chart.js library to dashboard.html (before closing body tag)
sed -i '/<\/body>/i\
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>' public/dashboard.html

# 5. Create backend endpoints for dashboard data
cat > server/routes/dashboard_stats.js << 'BACKEND_JS'
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
BACKEND_JS

# 6. Add dashboard stats routes to analytics.js
echo ""
echo "3️⃣ Integrating dashboard endpoints..."

# Insert dashboard routes after the router initialization
sed -i "/^const router = express.Router();/a\\
\\
// Dashboard Statistics\\
router.get('/dashboard-stats', async (req, res) => {\\
    try {\\
        const username = req.session.user.username;\\
        const totalResult = await pool.query('SELECT COUNT(*) as count FROM surveys WHERE owner = \$1', [username]);\\
        const accomResult = await pool.query('SELECT COUNT(*) as count FROM surveys WHERE owner = \$1 AND survey_type = \$2', [username, 'accommodation']);\\
        const daytripResult = await pool.query('SELECT COUNT(*) as count FROM surveys WHERE owner = \$1 AND survey_type = \$2', [username, 'daytrip']);\\
        const visitorsResult = await pool.query('SELECT COALESCE(SUM(CAST(party_size AS INTEGER)), 0) as total FROM surveys WHERE owner = \$1', [username]);\\
        res.json({\\
            totalSurveys: parseInt(totalResult.rows[0].count),\\
            accommodationSurveys: parseInt(accomResult.rows[0].count),\\
            daytripSurveys: parseInt(daytripResult.rows[0].count),\\
            totalVisitors: parseInt(visitorsResult.rows[0].total)\\
        });\\
    } catch (error) {\\
        console.error('Dashboard stats error:', error);\\
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });\\
    }\\
});\\
\\
router.get('/chart-data', async (req, res) => {\\
    try {\\
        const username = req.session.user.username;\\
        const monthlyResult = await pool.query(\`SELECT TO_CHAR(created_at, 'Mon YYYY') as month, COUNT(*) as count FROM surveys WHERE owner = \$1 AND created_at >= NOW() - INTERVAL '6 months' GROUP BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at) ORDER BY DATE_TRUNC('month', created_at)\`, [username]);\\
        const typeResult = await pool.query('SELECT survey_type, COUNT(*) as count FROM surveys WHERE owner = \$1 GROUP BY survey_type', [username]);\\
        const nationalityResult = await pool.query('SELECT origin as nationality, COUNT(*) as count FROM surveys WHERE owner = \$1 AND origin IS NOT NULL GROUP BY origin ORDER BY count DESC LIMIT 6', [username]);\\
        res.json({\\
            monthlyData: { labels: monthlyResult.rows.map(r => r.month), values: monthlyResult.rows.map(r => parseInt(r.count)) },\\
            surveyTypes: { accommodation: typeResult.rows.find(r => r.survey_type === 'accommodation')?.count || 0, daytrip: typeResult.rows.find(r => r.survey_type === 'daytrip')?.count || 0 },\\
            nationalities: { labels: nationalityResult.rows.map(r => r.nationality), values: nationalityResult.rows.map(r => parseInt(r.count)) }\\
        });\\
    } catch (error) {\\
        console.error('Chart data error:', error);\\
        res.status(500).json({ error: 'Failed to fetch chart data' });\\
    }\\
});" server/routes/analytics.js

echo ""
echo "✅ All fixes applied!"
echo ""
echo "��� CHANGES MADE:"
echo "  ✅ Accommodation icon now GREEN in light mode"
echo "  ✅ Real survey counts displayed in stat cards"
echo "  ✅ Total visitors calculated from party sizes"
echo "  ✅ Monthly trend bar chart added"
echo "  ✅ Survey type pie chart added"
echo "  ✅ Nationality distribution chart added"
echo "  ✅ Chart.js library included"
echo "  ✅ Backend endpoints created"

