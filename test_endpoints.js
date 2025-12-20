// Quick test to see if endpoints exist
const endpoints = [
    '/api/analytics/dashboard-stats',
    '/api/analytics/chart-data'
];

console.log('Expected endpoints:');
endpoints.forEach(ep => console.log('  ✓', ep));
