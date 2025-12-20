const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const ExcelJS = require('exceljs');

// Generate Regional Distribution Excel Report - Exact format from image
router.get('/regional-distribution/excel', requireAuth, async (req, res) => {
    try {
        const year = req.query.year || new Date().getFullYear();
        
        // Fetch nationality data
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
            { width: 30 },  // Country/Region
            { width: 8 },   // Jan
            { width: 8 },   // Feb
            { width: 8 },   // Mar
            { width: 8 },   // Apr
            { width: 8 },   // May
            { width: 8 },   // Jun
            { width: 8 },   // Jul
            { width: 8 },   // Aug
            { width: 8 },   // Sep
            { width: 8 },   // Oct
            { width: 8 },   // Nov
            { width: 8 },   // Dec
            { width: 12 },  // Total
            { width: 12 },  // % Difference
        ];

        // Add title
        worksheet.mergeCells('A1:O1');
        worksheet.getCell('A1').value = `REPORT ON THE REGIONAL DISTRIBUTION OF TRAVELERS (${year})`;
        worksheet.getCell('A1').font = { bold: true, size: 14 };
        worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

        // Add location
        worksheet.mergeCells('A2:O2');
        worksheet.getCell('A2').value = 'IRIGA CITY';
        worksheet.getCell('A2').font = { bold: true, size: 12 };
        worksheet.getCell('A2').alignment = { horizontal: 'center' };

        worksheet.mergeCells('A3:O3');
        worksheet.getCell('A3').value = 'CAMARINES SUR';
        worksheet.getCell('A3').font = { bold: true, size: 12 };
        worksheet.getCell('A3').alignment = { horizontal: 'center' };

        // Add Part I header
        worksheet.mergeCells('A5:O5');
        worksheet.getCell('A5').value = 'PART I: COUNTRY OF RESIDENCE';
        worksheet.getCell('A5').font = { bold: true, size: 11 };

        // Add column headers
        const headerRow = worksheet.getRow(7);
        headerRow.values = ['COUNTRY OF RESIDENCE', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'Total', '% Difference'];
        headerRow.font = { bold: true, size: 10 };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        headerRow.height = 30;
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
        };

        // Organize data by country and month
        const dataByCountry = {};
        result.rows.forEach(row => {
            if (!dataByCountry[row.country]) {
                dataByCountry[row.country] = new Array(12).fill(0);
            }
            dataByCountry[row.country][parseInt(row.month) - 1] = parseInt(row.count);
        });

        // Define region groups matching the image
        const regionGroups = {
            'FILIPINO NATIONALS/MAJORITY': ['Philippines'],
            'PHILIPPINE NATIONALS/MINORITY': [],  // Empty for now
            'ASEAN': ['Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Vietnam', 'Brunei', 'Myanmar', 'Cambodia', 'Laos'],
            'EAST ASIA': ['China', 'Japan', 'South Korea', 'Taiwan', 'Hong Kong', 'Macau'],
            'SOUTH ASIA': ['India', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Bhutan', 'Maldives'],
            'MIDDLE EAST': ['Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Turkey', 'Iran', 'Israel'],
            'EUROPE': ['United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Switzerland', 'Austria', 'Belgium', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Poland', 'Russia'],
            'NORTH AMERICA': ['United States', 'Canada', 'Mexico'],
            'OCEANIA': ['Australia', 'New Zealand', 'Fiji', 'Papua New Guinea'],
            'SOUTH AMERICA': ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Venezuela'],
            'AFRICA': ['South Africa', 'Egypt', 'Nigeria', 'Kenya', 'Morocco', 'Ethiopia']
        };

        let currentRow = 8;
        let grandTotal = 0;
        const grandTotalByMonth = new Array(12).fill(0);
        let philippineResidentsTotal = 0;
        const philippineResidentsByMonth = new Array(12).fill(0);

        // Add Filipino Nationals section
        const filipinoCountries = regionGroups['FILIPINO NATIONALS/MAJORITY'].filter(c => dataByCountry[c]);
        if (filipinoCountries.length > 0) {
            // Section header
            const sectionRow = worksheet.getRow(currentRow);
            sectionRow.getCell(1).value = 'FILIPINO NATIONALS/MAJORITY';
            sectionRow.font = { bold: true };
            sectionRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE6E6E6' }
            };
            currentRow++;

            let sectionTotal = 0;
            const sectionTotalByMonth = new Array(12).fill(0);

            filipinoCountries.forEach(country => {
                const row = worksheet.getRow(currentRow);
                const monthlyData = dataByCountry[country];
                const countryTotal = monthlyData.reduce((sum, val) => sum + val, 0);

                row.getCell(1).value = `  ${country}`;
                for (let i = 0; i < 12; i++) {
                    row.getCell(i + 2).value = monthlyData[i] || 0;
                    sectionTotalByMonth[i] += monthlyData[i] || 0;
                    philippineResidentsByMonth[i] += monthlyData[i] || 0;
                }
                row.getCell(14).value = countryTotal;
                sectionTotal += countryTotal;
                philippineResidentsTotal += countryTotal;
                currentRow++;
            });
        }

        // Add TOTAL PHILIPPINE RESIDENTS
        const phpRow = worksheet.getRow(currentRow);
        phpRow.getCell(1).value = 'TOTAL PHILIPPINE RESIDENTS';
        phpRow.font = { bold: true };
        for (let i = 0; i < 12; i++) {
            phpRow.getCell(i + 2).value = philippineResidentsByMonth[i];
            grandTotalByMonth[i] += philippineResidentsByMonth[i];
        }
        phpRow.getCell(14).value = philippineResidentsTotal;
        grandTotal += philippineResidentsTotal;
        phpRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF0F0F0' }
        };
        currentRow++;
        currentRow++; // Empty row

        // Add NON-PHILIPPINE RESIDENTS sections
        let nonPhilippineTotal = 0;
        const nonPhilippineTotalByMonth = new Array(12).fill(0);

        const nonPhilippineRegions = ['ASEAN', 'EAST ASIA', 'SOUTH ASIA', 'MIDDLE EAST', 'EUROPE', 'NORTH AMERICA', 'OCEANIA', 'SOUTH AMERICA', 'AFRICA'];

        for (const regionName of nonPhilippineRegions) {
            const countries = regionGroups[regionName];
            const regionCountries = countries.filter(c => dataByCountry[c]);
            
            if (regionCountries.length > 0) {
                // Region header
                const regionRow = worksheet.getRow(currentRow);
                regionRow.getCell(1).value = regionName;
                regionRow.font = { bold: true };
                regionRow.fill = {
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
                    }
                    row.getCell(14).value = countryTotal;
                    regionTotal += countryTotal;
                    currentRow++;
                });

                // Add region subtotal
                const subtotalRow = worksheet.getRow(currentRow);
                subtotalRow.getCell(1).value = `SUB-TOTAL`;
                subtotalRow.font = { bold: true };
                for (let i = 0; i < 12; i++) {
                    subtotalRow.getCell(i + 2).value = regionTotalByMonth[i];
                    nonPhilippineTotalByMonth[i] += regionTotalByMonth[i];
                }
                subtotalRow.getCell(14).value = regionTotal;
                nonPhilippineTotal += regionTotal;
                subtotalRow.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF0F0F0' }
                };
                currentRow++;
            }
        }

        // Add TOTAL NON-PHILIPPINE RESIDENTS
        const nonPhpRow = worksheet.getRow(currentRow);
        nonPhpRow.getCell(1).value = 'TOTAL NON-PHILIPPINE RESIDENTS';
        nonPhpRow.font = { bold: true };
        for (let i = 0; i < 12; i++) {
            nonPhpRow.getCell(i + 2).value = nonPhilippineTotalByMonth[i];
            grandTotalByMonth[i] += nonPhilippineTotalByMonth[i];
        }
        nonPhpRow.getCell(14).value = nonPhilippineTotal;
        grandTotal += nonPhilippineTotal;
        nonPhpRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE6E6E6' }
        };
        currentRow++;
        currentRow++; // Empty row

        // Add GRAND TOTAL
        const grandTotalRow = worksheet.getRow(currentRow);
        grandTotalRow.getCell(1).value = 'GRAND TOTAL GUEST ARRIVALS';
        grandTotalRow.font = { bold: true, size: 11 };
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
        for (let i = 7; i <= currentRow; i++) {
            const row = worksheet.getRow(i);
            for (let j = 1; j <= 15; j++) {
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
