// Dashboard Analytics - Load stats and charts
document.addEventListener('DOMContentLoaded', function() {
    const dashboardTab = document.querySelector('[data-section="dashboard"]');
    
    if (dashboardTab) {
        dashboardTab.addEventListener('click', loadDashboardAnalytics);
    }
    
    // Load on page load if dashboard is active
    if (window.location.hash === '#dashboard') {
        loadDashboardAnalytics();
    }
});

async function loadDashboardAnalytics() {
    try {
        const response = await fetch('/api/analytics/dashboard/stats');
        if (!response.ok) {
            throw new Error('Failed to load dashboard stats');
        }
        
        const data = await response.json();
        updateDashboardStats(data);
    } catch (error) {
        console.error('Dashboard analytics error:', error);
    }
}

function updateDashboardStats(data) {
    // Update stat cards
    const totalSurveysEl = document.getElementById('statSurveys');
    const attractionEl = document.getElementById('statAttractions');
    const accommodationEl = document.getElementById('statAccommodations');
    const visitorsEl = document.getElementById('statVisitors');
    
    if (totalSurveysEl) totalSurveysEl.textContent = data.totalSurveys || 0;
    if (attractionEl) attractionEl.textContent = data.attractionSurveys || 0;
    if (accommodationEl) accommodationEl.textContent = data.accommodationSurveys || 0;
    if (visitorsEl) visitorsEl.textContent = (data.totalVisitors || 0).toLocaleString();
    
    // Display monthly trends
    displayMonthlyTrends(data.monthlyData || []);
    
    // Display top nationalities
    displayTopNationalities(data.topNationalities || []);
}

function displayMonthlyTrends(monthlyData) {
    const container = document.getElementById('monthlyTrendsChart');
    if (!container) return;
    
    if (monthlyData.length === 0) {
        container.innerHTML = '<p class="no-data">No monthly data available</p>';
        return;
    }
    
    const html = `
        <div class="chart-container">
            <h3>Monthly Survey Trends</h3>
            <table class="trend-table">
                <thead>
                    <tr>
                        <th>Month</th>
                        <th>Surveys</th>
                    </tr>
                </thead>
                <tbody>
                    ${monthlyData.map(item => `
                        <tr>
                            <td>${formatMonth(item.month)}</td>
                            <td>${item.count}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
}

function displayTopNationalities(topNationalities) {
    const container = document.getElementById('topNationalitiesChart');
    if (!container) return;
    
    if (topNationalities.length === 0) {
        container.innerHTML = '<p class="no-data">No nationality data available</p>';
        return;
    }
    
    const html = `
        <div class="chart-container">
            <h3>Top 10 Nationalities</h3>
            <table class="nationality-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Country</th>
                        <th>Visitors</th>
                    </tr>
                </thead>
                <tbody>
                    ${topNationalities.map((item, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${item.country}</td>
                            <td>${parseInt(item.total).toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
}

function formatMonth(monthString) {
    const [year, month] = monthString.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}
