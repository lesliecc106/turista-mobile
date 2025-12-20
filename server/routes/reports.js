const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const ExcelJS = require('exceljs');

// Generate Regional Distribution Excel Report
router.get('/regional-distribution/excel', requireAuth, async (req, res) => {
    try {
        const year = req.query.year || new Date().getFullYear();
        
        // Fetch data
        const result = await pool.query(
            `SELECT 
                origin as country,
                EXTRACT(MONTH FROM created_at) as month,
                SUM(count) as count
             FROM regional_distribution
             WHERE owner = $1 
               AND EXTRACT(YEAR FROM created_at) = $2
             GROUP BY origin, month
             ORDER BY country, month`,
            [req.session.user.username, year]
        );

        // Create workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Regional Distribution');

        // Set column widths
        worksheet.columns = [
            { width: 25 },  // Country/Region
            { width: 10 },  // Jan
            { width: 10 },  // Feb
            { width: 10 },  // Mar
            { width: 10 },  // Apr
            { width: 10 },  // May
            { width: 10 },  // Jun
            { width: 10 },  // Jul
            { width: 10 },  // Aug
            { width: 10 },  // Sep
            { width: 10 },  // Oct
            { width: 10 },  // Nov
            { width: 10 },  // Dec
            { width: 12 }   // Total
        ];

        // Add title
        worksheet.mergeCells('A1:N1');
        worksheet.getCell('A1').value = `REPORT ON THE REGIONAL DISTRIBUTION OF TRAVELERS (${year})`;
        worksheet.getCell('A1').font = { bold: true, size: 14 };
        worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

        // Add subtitle
        worksheet.mergeCells('A2:N2');
        worksheet.getCell('A2').value = 'Iriga City, Camarines Sur';
        worksheet.getCell('A2').font = { bold: true, size: 12 };
        worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };

        // Add headers
        const headerRow = worksheet.getRow(4);
        headerRow.values = ['Country/Region', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Total'];
        headerRow.font = { bold: true };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
        };

        // Group data by region
        const regions = {
            'ASEAN': ['Philippines', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Vietnam', 'Brunei', 'Myanmar', 'Cambodia', 'Laos'],
            'EAST ASIA': ['China', 'Japan', 'South Korea', 'Taiwan', 'Hong Kong', 'Macau'],
            'SOUTH ASIA': ['India', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Bhutan', 'Maldives'],
            'MIDDLE EAST': ['Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Turkey', 'Iran', 'Israel'],
            'EUROPE': ['United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Switzerland', 'Austria', 'Belgium', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Poland', 'Russia'],
            'NORTH AMERICA': ['United States', 'Canada', 'Mexico'],
            'OCEANIA': ['Australia', 'New Zealand', 'Fiji', 'Papua New Guinea'],
            'SOUTH AMERICA': ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Venezuela'],
            'AFRICA': ['South Africa', 'Egypt', 'Nigeria', 'Kenya', 'Morocco', 'Ethiopia']
        };

        // Organize data by country and month
        const dataByCountry = {};
        result.rows.forEach(row => {
            if (!dataByCountry[row.country]) {
                dataByCountry[row.country] = new Array(12).fill(0);
            }
            dataByCountry[row.country][parseInt(row.month) - 1] = parseInt(row.count);
        });

        let currentRow = 5;
        let grandTotal = 0;
        const grandTotalByMonth = new Array(12).fill(0);

        // Add data by region
        for (const [regionName, countries] of Object.entries(regions)) {
            const regionCountries = countries.filter(c => dataByCountry[c]);
            
            if (regionCountries.length > 0) {
                // Add region header
                const regionRow = worksheet.getRow(currentRow);
                regionRow.getCell(1).value = regionName;
                regionRow.getCell(1).font = { bold: true };
                regionRow.getCell(1).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE6E6E6' }
                };
                currentRow++;

                let regionTotal = 0;
                const regionTotalByMonth = new Array(12).fill(0);

                // Add countries in region
                regionCountries.forEach(country => {
                    const row = worksheet.getRow(currentRow);
                    const monthlyData = dataByCountry[country];
                    const countryTotal = monthlyData.reduce((sum, val) => sum + val, 0);

                    row.getCell(1).value = `  ${country}`;
                    for (let i = 0; i < 12; i++) {
                        row.getCell(i + 2).value = monthlyData[i] || 0;
                        regionTotalByMonth[i] += monthlyData[i] || 0;
                        grandTotalByMonth[i] += monthlyData[i] || 0;
                    }
                    row.getCell(14).value = countryTotal;
                    regionTotal += countryTotal;
                    grandTotal += countryTotal;

                    currentRow++;
                });

                // Add region subtotal
                const subtotalRow = worksheet.getRow(currentRow);
                subtotalRow.getCell(1).value = `Subtotal - ${regionName}`;
                subtotalRow.font = { bold: true };
                for (let i = 0; i < 12; i++) {
                    subtotalRow.getCell(i + 2).value = regionTotalByMonth[i];
                }
                subtotalRow.getCell(14).value = regionTotal;
                subtotalRow.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF0F0F0' }
                };
                currentRow++;
            }
        }

        // Add grand total
        const grandTotalRow = worksheet.getRow(currentRow);
        grandTotalRow.getCell(1).value = 'GRAND TOTAL';
        grandTotalRow.font = { bold: true };
        for (let i = 0; i < 12; i++) {
            grandTotalRow.getCell(i + 2).value = grandTotalByMonth[i];
        }
        grandTotalRow.getCell(14).value = grandTotal;
        grandTotalRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFCC00' }
        };

        // Add borders to all cells
        for (let i = 4; i <= currentRow; i++) {
            const row = worksheet.getRow(i);
            for (let j = 1; j <= 14; j++) {
                row.getCell(j).border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            }
        }

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Regional_Distribution_${year}.xlsx`);

        // Write to response
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Excel report generation error:', error);
        res.status(500).json({ error: 'Failed to generate Excel report' });
    }
});

module.exports = router;
