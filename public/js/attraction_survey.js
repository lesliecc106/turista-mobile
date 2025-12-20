// Function to collect nationality data from the dynamic form
function collectNationalityData() {
    const nationalityRows = [];
    const rows = document.querySelectorAll('.nationality-row');

    rows.forEach(row => {
        const select = row.querySelector('.nationality-select');
        const countInput = row.querySelector('.nationality-count');

        const nationality = select.value;
        const count = parseInt(countInput.value) || 0;

        if (nationality && count > 0) {
            nationalityRows.push({
                nat: nationality,      // ✅ Changed from "nationality" to "nat"
                count: count
            });
        }
    });

    return nationalityRows;
}

// Enhanced form submission handler
document.addEventListener('DOMContentLoaded', function() {
    const surveyForm = document.getElementById('attractionSurveyForm');

    if (surveyForm) {
        surveyForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Collect basic form data
            const formData = new FormData(surveyForm);
            const surveyData = {};

            // Convert FormData to object
            for (let [key, value] of formData.entries()) {
                surveyData[key] = value;
            }

            // Add nationality data if multiple nationalities selected
            const multipleNationalities = document.querySelector('input[name="multipleNationalities"]:checked');
            
            if (multipleNationalities && multipleNationalities.value === 'yes') {
                const nationalityRows = collectNationalityData();
                
                if (nationalityRows.length === 0) {
                    alert('Please add at least one nationality with a valid count.');
                    return;
                }
                
                surveyData.nationalityRows = nationalityRows;  // ✅ Correct field name
            } else {
                // If no multiple nationalities, send empty array
                surveyData.nationalityRows = [];
            }

            // Map form fields to backend expected format
            const apiData = {
                surveyDate: surveyData.surveyDate,
                attractionName: surveyData.attractionName,
                city: surveyData.city,
                province: surveyData.province,
                code: surveyData.code || '',
                enumerator: surveyData.enumerator,
                visitDate: surveyData.visitDate,  // Using survey date as visit date
                residence: `${surveyData.residenceCity || ''}, ${surveyData.residenceProvince || ''}`.trim(),
                purpose: surveyData.purpose || surveyData.purposeOther || '',
                transport: surveyData.transport || '',
                groupSize: parseInt(surveyData.groupSize) || 0,
                stay: surveyData.stay || "Day trip",
                nationalityRows: surveyData.nationalityRows
            };

            console.log('Survey Data:', apiData);

            try {
                const response = await fetch('/api/surveys/attraction', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(apiData)
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    alert('Survey submitted successfully!');
                    surveyForm.reset();
                    
                    // Hide nationality section
                    const nationalitySection = document.getElementById('nationalitySection');
                    if (nationalitySection) {
                        nationalitySection.style.display = 'none';
                    }
                    
                    // Clear nationality rows
                    const container = document.getElementById('nationalityRowsContainer');
                    if (container) {
                        container.innerHTML = '';
                    }
                    
                    // Redirect or refresh
                    window.location.reload();
                } else {
                    throw new Error(result.error || 'Submission failed');
                }
            } catch (error) {
                console.error('Error submitting survey:', error);
                alert('Failed to submit survey. Please try again.');
            }
        });
    }
});

// Ensure at least one nationality entry before submission
document.querySelector('#attractionSurveyForm').addEventListener('submit', function(e) {
    const nationalityRows = document.querySelectorAll('.nationality-row');
    if (nationalityRows.length === 0) {
        e.preventDefault();
        alert('Please add at least one nationality entry in Q9');
        return false;
    }
});
