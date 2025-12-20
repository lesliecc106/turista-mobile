// Reports Tab - Download Excel Reports
document.addEventListener('DOMContentLoaded', function() {
    const reportsTab = document.querySelector('[data-section="reports"]');
    
    if (reportsTab) {
        reportsTab.addEventListener('click', loadReportsPage);
    }
});

function loadReportsPage() {
    const container = document.getElementById('reportsContent');
    
    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear - 1, currentYear - 2];
    
    const html = `
        <div class="reports-container">
            <h2>í³Š Download Reports</h2>
            
            <div class="report-section">
                <h3>Regional Distribution Report</h3>
                <p>Download the Regional Distribution of Travelers report in Excel format.</p>
                
                <div class="report-options">
                    <label for="reportYear">Select Year:</label>
                    <select id="reportYear" class="form-select">
                        ${years.map(year => `<option value="${year}">${year}</option>`).join('')}
                    </select>
                    
                    <button id="downloadRegionalReport" class="btn-primary">
                        <i class="fas fa-download"></i> Download Excel Report
                    </button>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Add event listener to download button
    document.getElementById('downloadRegionalReport').addEventListener('click', downloadRegionalReport);
}

function downloadRegionalReport() {
    const year = document.getElementById('reportYear').value;
    const button = document.getElementById('downloadRegionalReport');
    
    // Disable button and show loading
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    
    // Download the report
    window.location.href = `/api/reports/regional-distribution/excel?year=${year}`;
    
    // Re-enable button after 3 seconds
    setTimeout(() => {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-download"></i> Download Excel Report';
    }, 3000);
}
