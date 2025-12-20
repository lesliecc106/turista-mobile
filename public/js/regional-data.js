// Regional Data Tab - Nationality Distribution Display
document.addEventListener('DOMContentLoaded', function() {
    const regionalTab = document.querySelector('[data-section="regional"]');
    
    if (regionalTab) {
        regionalTab.addEventListener('click', loadRegionalData);
    }
});

async function loadRegionalData() {
    try {
        const response = await fetch('/api/analytics/regional-data');
        if (!response.ok) {
            throw new Error('Failed to load regional data');
        }
        
        const data = await response.json();
        displayRegionalData(data.data);
    } catch (error) {
        console.error('Regional data load error:', error);
        document.getElementById('regionalContent').innerHTML = 
            '<p class="error-message">Failed to load regional distribution data</p>';
    }
}

function displayRegionalData(data) {
    const container = document.getElementById('regionalContent');
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p class="no-data">No regional data available yet</p>';
        return;
    }
    
    // Group by region
    const grouped = groupByRegion(data);
    
    let html = '<div class="regional-data-container">';
    html += '<h2>Regional Distribution of Travelers</h2>';
    
    let grandTotal = 0;
    
    // Display each region
    for (const [region, countries] of Object.entries(grouped)) {
        const regionTotal = countries.reduce((sum, c) => sum + parseInt(c.total_count), 0);
        grandTotal += regionTotal;
        
        html += `
            <div class="region-section">
                <h3>${region}</h3>
                <table class="regional-table">
                    <thead>
                        <tr>
                            <th>Country</th>
                            <th>Total Visitors</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${countries.map(country => `
                            <tr>
                                <td>${country.country}</td>
                                <td class="number">${parseInt(country.total_count).toLocaleString()}</td>
                            </tr>
                        `).join('')}
                        <tr class="subtotal-row">
                            <td><strong>Subtotal - ${region}</strong></td>
                            <td class="number"><strong>${regionTotal.toLocaleString()}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }
    
    html += `
        <div class="grand-total">
            <h3>Grand Total: ${grandTotal.toLocaleString()} Visitors</h3>
        </div>
    </div>`;
    
    container.innerHTML = html;
}

function groupByRegion(data) {
    const regions = {
        'ASEAN': ['Philippines', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Vietnam', 'Brunei', 'Myanmar', 'Cambodia', 'Laos'],
        'East Asia': ['China', 'Japan', 'South Korea', 'Taiwan', 'Hong Kong', 'Macau'],
        'South Asia': ['India', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Bhutan', 'Maldives'],
        'Middle East': ['Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Turkey', 'Iran', 'Israel'],
        'Europe': ['United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Switzerland', 'Austria', 'Belgium', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Poland', 'Russia'],
        'North America': ['United States', 'Canada', 'Mexico'],
        'Oceania': ['Australia', 'New Zealand', 'Fiji', 'Papua New Guinea'],
        'South America': ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Venezuela'],
        'Africa': ['South Africa', 'Egypt', 'Nigeria', 'Kenya', 'Morocco', 'Ethiopia']
    };
    
    const grouped = {};
    
    data.forEach(item => {
        let assigned = false;
        for (const [region, countries] of Object.entries(regions)) {
            if (countries.includes(item.country)) {
                if (!grouped[region]) grouped[region] = [];
                grouped[region].push(item);
                assigned = true;
                break;
            }
        }
        if (!assigned) {
            if (!grouped['Other']) grouped['Other'] = [];
            grouped['Other'].push(item);
        }
    });
    
    return grouped;
}
