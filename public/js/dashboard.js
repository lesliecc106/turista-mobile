console.log('Dashboard.js loaded - Enhanced version');

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded - Starting dashboard load');
    await loadDashboardData();
    await loadCharts();
});

async function loadDashboardData() {
    console.log('Fetching dashboard stats...');
    try {
        const response = await fetch('/api/analytics/dashboard-stats', { credentials: 'include' });
        console.log('Dashboard stats response:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Dashboard stats failed:', response.status, errorText);
            throw new Error('Failed to fetch dashboard stats');
        }

        const data = await response.json();
        console.log('✅ Dashboard data received:', data);

        const stats = document.querySelectorAll('.stat-number');
        console.log('Found stat elements:', stats.length);

        if (stats.length >= 4) {
            stats[0].textContent = data.totalSurveys || 0;
            stats[1].textContent = data.accommodationSurveys || 0;
            stats[2].textContent = data.daytripSurveys || 0;
            stats[3].textContent = (data.totalVisitors || 0).toLocaleString();
            
            animateNumbers(stats, data);
            console.log('✅ Stats updated successfully');
        } else {
            console.error('❌ Not enough stat elements found:', stats.length);
        }

    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
    }
}

function animateNumbers(elements, data) {
    const values = [
        data.totalSurveys || 0,
        data.accommodationSurveys || 0,
        data.daytripSurveys || 0,
        data.totalVisitors || 0
    ];
    
    elements.forEach((element, index) => {
        const finalValue = values[index];
        const duration = 1000;
        const steps = 30;
        const stepValue = finalValue / steps;
        let currentStep = 0;
        
        const interval = setInterval(() => {
            currentStep++;
            if (currentStep >= steps) {
                element.textContent = finalValue.toLocaleString();
                clearInterval(interval);
            } else {
                const currentValue = Math.floor(stepValue * currentStep);
                element.textContent = currentValue.toLocaleString();
            }
        }, duration / steps);
    });
}

async function loadCharts() {
    console.log('Fetching chart data...');
    try {
        const response = await fetch('/api/analytics/chart-data', { credentials: 'include' });
        console.log('Chart data response:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Chart data failed:', response.status, errorText);
            throw new Error('Failed to fetch chart data');
        }

        const data = await response.json();
        console.log('✅ Chart data received:', data);

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
        console.error('❌ Error loading charts:', error);
    }
}

function createMonthlyChart(monthlyData) {
    const ctx = document.getElementById('monthlyChart');
    if (!ctx) return;
    
    const chartContext = ctx.getContext('2d');
    
    if (window.monthlyChartInstance) {
        window.monthlyChartInstance.destroy();
    }
    
    window.monthlyChartInstance = new Chart(chartContext, {
        type: 'bar',
        data: {
            labels: monthlyData.labels,
            datasets: [{
                label: 'Surveys per Month',
                data: monthlyData.values,
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12
                }
            },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
        }
    });
}

function createSurveyTypePie(surveyTypes) {
    const ctx = document.getElementById('surveyTypePie');
    if (!ctx) return;
    
    const chartContext = ctx.getContext('2d');
    
    if (window.surveyTypeChartInstance) {
        window.surveyTypeChartInstance.destroy();
    }
    
    window.surveyTypeChartInstance = new Chart(chartContext, {
        type: 'doughnut',
        data: {
            labels: ['Accommodation', 'Day Trip'],
            datasets: [{
                data: [surveyTypes.accommodation, surveyTypes.daytrip],
                backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(139, 92, 246, 0.8)'],
                borderColor: ['rgba(16, 185, 129, 1)', 'rgba(139, 92, 246, 1)'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: { position: 'bottom' }
            },
            cutout: '65%'
        }
    });
}

function createNationalityPie(nationalities) {
    const ctx = document.getElementById('nationalityPie');
    if (!ctx) return;
    
    const chartContext = ctx.getContext('2d');
    
    if (window.nationalityChartInstance) {
        window.nationalityChartInstance.destroy();
    }
    
    const colors = [
        'rgba(239, 68, 68, 0.8)', 'rgba(249, 115, 22, 0.8)',
        'rgba(234, 179, 8, 0.8)', 'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)', 'rgba(168, 85, 247, 0.8)'
    ];
    
    window.nationalityChartInstance = new Chart(chartContext, {
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
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: { position: 'bottom' }
            },
            cutout: '60%'
        }
    });
}
