// History Tab - Survey Records Display
document.addEventListener('DOMContentLoaded', function() {
    const historyTab = document.querySelector('[data-section="history"]');
    
    if (historyTab) {
        historyTab.addEventListener('click', loadHistoryData);
    }
});

async function loadHistoryData() {
    try {
        const response = await fetch('/api/analytics/history');
        if (!response.ok) {
            throw new Error('Failed to load history');
        }
        
        const data = await response.json();
        displayHistoryData(data.surveys);
    } catch (error) {
        console.error('History load error:', error);
        document.getElementById('historyContent').innerHTML = 
            '<p class="error-message">Failed to load survey history</p>';
    }
}

function displayHistoryData(surveys) {
    const container = document.getElementById('historyContent');
    
    if (!surveys || surveys.length === 0) {
        container.innerHTML = '<p class="no-data">No surveys submitted yet</p>';
        return;
    }
    
    const table = `
        <div class="history-table-container">
            <h2>Survey History</h2>
            <table class="history-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Name</th>
                        <th>Enumerator</th>
                        <th>Submitted</th>
                    </tr>
                </thead>
                <tbody>
                    ${surveys.map(survey => `
                        <tr>
                            <td>${formatDate(survey.survey_date)}</td>
                            <td><span class="badge badge-${survey.type.toLowerCase()}">${survey.type}</span></td>
                            <td>${survey.name}</td>
                            <td>${survey.enumerator}</td>
                            <td>${formatDateTime(survey.created_at)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = table;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
