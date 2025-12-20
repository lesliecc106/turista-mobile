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
