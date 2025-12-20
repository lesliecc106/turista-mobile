// Reports Page - Generate and Download Reports
document.addEventListener('DOMContentLoaded', function() {
    const reportsTab = document.querySelector('[data-section="reports"]');
    
    if (reportsTab) {
        reportsTab.addEventListener('click', loadReportsPage);
    }
});

function loadReportsPage() {
    const container = document.getElementById('reportsContent');
    
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
        years.push(currentYear - i);
    }
    
    container.innerHTML = `
        <div class="reports-page">
            <div class="report-header">
                <div class="report-icon">
                    <i class="fas fa-file-excel"></i>
                </div>
                <h2>Generate Reports</h2>
                <p class="subtitle">Download regional distribution reports in Excel format</p>
            </div>
            
            <div class="report-card">
                <div class="report-info">
                    <h3><i class="fas fa-globe-asia"></i> Regional Distribution Report</h3>
                    <p>Comprehensive report showing visitor distribution by country and region throughout the year.</p>
                    <ul class="report-features">
                        <li><i class="fas fa-check-circle"></i> Monthly visitor statistics</li>
                        <li><i class="fas fa-check-circle"></i> Country-wise breakdown</li>
                        <li><i class="fas fa-check-circle"></i> Regional grouping (ASEAN, East Asia, Europe, etc.)</li>
                        <li><i class="fas fa-check-circle"></i> Philippine vs Non-Philippine residents</li>
                        <li><i class="fas fa-check-circle"></i> Grand totals and sub-totals</li>
                    </ul>
                </div>
                
                <div class="report-controls">
                    <div class="form-group">
                        <label for="reportYear">
                            <i class="fas fa-calendar-alt"></i> Select Year
                        </label>
                        <select id="reportYear" class="form-control">
                            ${years.map(year => `<option value="${year}" ${year === currentYear ? 'selected' : ''}>${year}</option>`).join('')}
                        </select>
                    </div>
                    
                    <button class="btn btn-download" onclick="downloadRegionalReport()">
                        <i class="fas fa-download"></i>
                        <span>Download Excel Report</span>
                    </button>
                    
                    <div id="downloadStatus" class="download-status"></div>
                </div>
            </div>
            
            <div class="report-preview">
                <h3><i class="fas fa-eye"></i> Report Preview</h3>
                <div class="preview-content">
                    <div class="preview-header">
                        <h4>REPORT ON THE REGIONAL DISTRIBUTION OF TRAVELERS (${currentYear})</h4>
                        <p>IRIGA CITY<br>CAMARINES SUR</p>
                    </div>
                    <div class="preview-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Country of Residence</th>
                                    <th>Jan</th>
                                    <th>Feb</th>
                                    <th>Mar</th>
                                    <th>...</th>
                                    <th>Dec</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="section-header">
                                    <td colspan="7">FILIPINO NATIONALS/MAJORITY</td>
                                </tr>
                                <tr>
                                    <td>&nbsp;&nbsp;Philippines</td>
                                    <td colspan="6">...</td>
                                </tr>
                                <tr class="section-header">
                                    <td colspan="7">ASEAN</td>
                                </tr>
                                <tr>
                                    <td colspan="7" style="text-align: center; padding: 20px;">
                                        <i class="fas fa-info-circle"></i> Full data will be in the downloaded Excel file
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function downloadRegionalReport() {
    const year = document.getElementById('reportYear').value;
    const statusDiv = document.getElementById('downloadStatus');
    const downloadBtn = document.querySelector('.btn-download');
    
    try {
        downloadBtn.disabled = true;
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        statusDiv.innerHTML = '<div class="status-info"><i class="fas fa-info-circle"></i> Preparing your report...</div>';
        
        const response = await fetch(`/api/reports/regional-distribution/excel?year=${year}`);
        
        if (!response.ok) {
            throw new Error('Failed to generate report');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Regional_Distribution_${year}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        statusDiv.innerHTML = '<div class="status-success"><i class="fas fa-check-circle"></i> Report downloaded successfully!</div>';
        setTimeout(() => {
            statusDiv.innerHTML = '';
        }, 3000);
        
    } catch (error) {
        console.error('Download error:', error);
        statusDiv.innerHTML = '<div class="status-error"><i class="fas fa-exclamation-circle"></i> Failed to download report. Please try again.</div>';
    } finally {
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '<i class="fas fa-download"></i><span>Download Excel Report</span>';
    }
}
