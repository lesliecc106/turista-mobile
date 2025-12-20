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

async function displayHistoryData(surveys) {
    const container = document.getElementById('historyContent');
    
    if (!surveys || surveys.length === 0) {
        container.innerHTML = '<p class="no-data">No surveys submitted yet</p>';
        return;
    }
    
    // Fetch nationality details for each survey
    const surveysWithNationalities = await Promise.all(surveys.map(async (survey) => {
        try {
            const type = survey.type.toLowerCase();
            const endpoint = type === 'attraction' ? 'attraction' : 'accommodation';
            const response = await fetch(`/api/surveys/${endpoint}/${survey.id}/nationalities`);
            const natData = await response.json();
            survey.nationalities = natData.nationalities || [];
        } catch (error) {
            survey.nationalities = [];
        }
        return survey;
    }));
    
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
                        <th>Nationalities</th>
                        <th>Submitted</th>
                    </tr>
                </thead>
                <tbody>
                    ${surveysWithNationalities.map(survey => `
                        <tr>
                            <td>${formatDate(survey.survey_date)}</td>
                            <td><span class="badge badge-${survey.type.toLowerCase()}">${survey.type}</span></td>
                            <td>${survey.name}</td>
                            <td>${survey.enumerator}</td>
                            <td>${formatNationalities(survey.nationalities)}</td>
                            <td>${formatDateTime(survey.created_at)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = table;
}

function formatNationalities(nationalities) {
    if (!nationalities || nationalities.length === 0) {
        return '<span class="no-data">None</span>';
    }
    
    return nationalities.map(nat => `${nat.country}: ${nat.count}`).join(', ');
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
