console.log('Ì¥∑ Dashboard.js loaded');

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Ì¥∑ DOMContentLoaded - Starting dashboard load');
    await loadDashboardData();
    await loadCharts();
});

async function loadDashboardData() {
    console.log('Ì¥∑ Fetching dashboard stats...');
    try {
        const response = await fetch('/api/analytics/dashboard-stats');
        console.log('Ì¥∑ Dashboard stats response:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('‚ùå Dashboard stats failed:', response.status, errorText);
            throw new Error('Failed to fetch dashboard stats');
        }
        
        const data = await response.json();
        console.log('‚úÖ Dashboard data received:', data);
        
        // Update stat cards with real data
        const stats = document.querySelectorAll('.stat-number');
        console.log('Ì¥∑ Found stat elements:', stats.length);
        
        if (stats.length >= 4) {
            stats[0].textContent = data.totalSurveys || 0;
            stats[1].textContent = data.accommodationSurveys || 0;
            stats[2].textContent = data.daytripSurveys || 0;
            stats[3].textContent = data.totalVisitors || 0;
            console.log('‚úÖ Stats updated successfully');
        } else {
            console.error('‚ùå Not enough stat elements found:', stats.length);
        }
        
    } catch (error) {
        console.error('‚ùå Error loading dashboard data:', error);
    }
}

async function loadCharts() {
    console.log('Ì¥∑ Fetching chart data...');
    try {
        const response = await fetch('/api/analytics/chart-data');
        console.log('Ì¥∑ Chart data response:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('‚ùå Chart data failed:', response.status, errorText);
            throw new Error('Failed to fetch chart data');
        }
        
        const data = await response.json();
        console.log('‚úÖ Chart data received:', data);
        
        // Create charts
        if (document.getElementById('monthlyChart')) {
            createMonthlyChart(data.monthlyData);
        }
        if (document.getElementById('surveyTypePie')) {
            createSurveyTypePie(data.surveyTypes);
        }
        if (document.getElementById('nationalityPie')) {
            createNationalityPie(data.nationalities);
        }
        
    } catch (error) {
        console.error('‚ùå Error loading charts:', error);
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
                legend: { display: true, position: 'top' },
                title: { display: true, text: 'Monthly Survey Collection', font: { size: 16, weight: 'bold' } }
            },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
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
                backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(59, 130, 246, 0.8)'],
                borderColor: ['rgba(16, 185, 129, 1)', 'rgba(59, 130, 246, 1)'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
                title: { display: true, text: 'Survey Type Distribution', font: { size: 16, weight: 'bold' } }
            }
        }
    });
}

function createNationalityPie(nationalities) {
    const ctx = document.getElementById('nationalityPie').getContext('2d');
    const colors = [
        'rgba(239, 68, 68, 0.8)', 'rgba(249, 115, 22, 0.8)', 'rgba(234, 179, 8, 0.8)',
        'rgba(34, 197, 94, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(168, 85, 247, 0.8)'
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
                legend: { position: 'bottom', labels: { boxWidth: 15, padding: 10 } },
                title: { display: true, text: 'Top Nationalities', font: { size: 16, weight: 'bold' } }
            }
        }
    });
}
