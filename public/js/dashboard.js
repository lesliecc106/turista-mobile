/**
 * TURIS-TA Dashboard Module
 * Analytics and visualization functions for tourism data
 */

// Global chart instances
window.topChart = null;
window.pieChart = null;

/**
 * Main dashboard render function
 * Refreshes all dashboard components
 */
function renderDashboard() {
  renderDashboardCharts();
  renderDashboardRecent();
  toast('Dashboard refreshed');
}

/**
 * Render dashboard charts (bar chart and pie chart)
 * Displays top 10 origins and their distribution
 */
function renderDashboardCharts() {
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js not loaded - cannot render charts');
    return;
  }

  const totals = compileRegionalTotals();
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const top10 = sorted.slice(0, 10);

  if (top10.length === 0) {
    console.warn('No data available for charts');
    return;
  }

  // Render Top Origins Bar Chart
  renderTopOriginsChart(top10);

  // Render Distribution Pie Chart
  renderDistributionPieChart(top10);
}

/**
 * Render bar chart showing top 10 visitor origins
 * @param {Array} top10 - Array of [country, count] tuples
 */
function renderTopOriginsChart(top10) {
  const topCtx = document.getElementById('topOriginsChart');
  if (!topCtx) {
    console.warn('Top origins chart canvas not found');
    return;
  }

  // Destroy existing chart if it exists
  if (window.topChart) {
    window.topChart.destroy();
  }

  // Create new bar chart
  window.topChart = new Chart(topCtx, {
    type: 'bar',
    data: {
      labels: top10.map(([country]) => country),
      datasets: [{
        label: 'Visitor Count',
        data: top10.map(([, count]) => count),
        backgroundColor: 'rgba(14, 107, 168, 0.7)',
        borderColor: 'rgba(14, 107, 168, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          display: false 
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          cornerRadius: 8,
          titleFont: {
            size: 14,
            weight: 'bold'
          },
          bodyFont: {
            size: 13
          },
          callbacks: {
            label: function(context) {
              return 'Visitors: ' + context.parsed.y.toLocaleString();
            }
          }
        }
      },
      scales: {
        y: { 
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return value.toLocaleString();
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            maxRotation: 45,
            minRotation: 0
          }
        }
      }
    }
  });
}

/**
 * Render pie chart showing origin distribution
 * @param {Array} top10 - Array of [country, count] tuples
 */
function renderDistributionPieChart(top10) {
  const pieCtx = document.getElementById('pieOriginsChart');
  if (!pieCtx) {
    console.warn('Pie chart canvas not found');
    return;
  }

  // Destroy existing chart if it exists
  if (window.pieChart) {
    window.pieChart.destroy();
  }

  // Color palette for pie chart
  const colors = [
    '#0e6ba8', '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16'
  ];

  // Create new pie chart
  window.pieChart = new Chart(pieCtx, {
    type: 'pie',
    data: {
      labels: top10.map(([country]) => country),
      datasets: [{
        data: top10.map(([, count]) => count),
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: 'right',
          labels: {
            padding: 15,
            font: {
              size: 12
            },
            generateLabels: function(chart) {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                return data.labels.map((label, i) => {
                  const value = data.datasets[0].data[i];
                  const percentage = ((value / total) * 100).toFixed(1);
                  return {
                    text: `${label} (${percentage}%)`,
                    fillStyle: data.datasets[0].backgroundColor[i],
                    hidden: false,
                    index: i
                  };
                });
              }
              return [];
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          cornerRadius: 8,
          titleFont: {
            size: 14,
            weight: 'bold'
          },
          bodyFont: {
            size: 13
          },
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value.toLocaleString()} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

/**
 * Render recent submissions section
 * Shows last 5 attraction and accommodation submissions
 */
function renderDashboardRecent() {
  const el = document.getElementById('dashboardRecent');
  if (!el) {
    console.warn('Dashboard recent element not found');
    return;
  }

  // Get data from localStorage
  let DB;
  try {
    DB = JSON.parse(localStorage.getItem('turista_data') || '{"attractions":[],"accommodations":[]}');
  } catch(e) {
    DB = { attractions: [], accommodations: [] };
  }

  // Combine and sort recent submissions
  const recent = [
    ...(DB.attractions || []).map(a => ({ 
      type: 'Attraction', 
      name: a.name || 'Unknown', 
      ts: a.ts || Date.now() 
    })),
    ...(DB.accommodations || []).map(a => ({ 
      type: 'Accommodation', 
      name: a.establishmentName || 'Unknown', 
      ts: a.ts || Date.now() 
    }))
  ]
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 5);

  // Render HTML
  if (recent.length === 0) {
    el.innerHTML = '<div class="small muted">No recent submissions yet. Submit surveys to see them here.</div>';
    return;
  }

  el.innerHTML = recent.map(r => {
    const escapedName = escapeHtml(r.name);
    const dateStr = new Date(r.ts).toLocaleString();
    const icon = r.type === 'Attraction' ? '🏞️' : '🏨';
    
    return `
      <div class="note-item">
        <div>
          <div class="note-sub">${icon} ${r.type}: ${escapedName}</div>
        </div>
        <div class="note-ts">${dateStr}</div>
      </div>
    `;
  }).join('');
}

/**
 * Helper: Compile regional totals from database
 * @returns {Object} Object with country as key and total count as value
 */
function compileRegionalTotals() {
  let DB;
  try {
    DB = JSON.parse(localStorage.getItem('turista_data') || '{"regional":[]}');
  } catch(e) {
    DB = { regional: [] };
  }

  const totals = {};
  (DB.regional || []).forEach(r => {
    const origin = r.origin || 'Unknown';
    const count = Number(r.count) || 0;
    totals[origin] = (totals[origin] || 0) + count;
  });

  return totals;
}

/**
 * Helper: Escape HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Helper: Show toast notification
 * @param {string} msg - Message to display
 * @param {number} duration - Duration in milliseconds
 */
function toast(msg, duration = 2000) {
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = `
    position: fixed;
    left: 50%;
    bottom: 80px;
    transform: translateX(-50%);
    background: var(--card);
    color: var(--ink);
    padding: 12px 20px;
    border-radius: 12px;
    box-shadow: var(--shadow-lg);
    z-index: 9999;
    font-weight: 600;
    animation: slideUp 0.3s ease;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.style.opacity = '0', duration - 300);
  setTimeout(() => el.remove(), duration);
}

/**
 * Initialize dashboard on page load if on dashboard section
 */
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on the dashboard section
  const dashboardSection = document.getElementById('dashboard');
  if (dashboardSection && !dashboardSection.classList.contains('hide')) {
    renderDashboard();
  }
});

// Export functions for use in main app
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    renderDashboard,
    renderDashboardCharts,
    renderDashboardRecent,
    compileRegionalTotals
  };
}

console.log('📊 Dashboard module loaded successfully');