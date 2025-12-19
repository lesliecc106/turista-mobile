// Conditional Logic for Tourism Attraction Survey

document.addEventListener('DOMContentLoaded', function() {
    // Q1: Residence - show/hide follow-up fields
    document.querySelectorAll('input[name="residence"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.getElementById('outsideGroup').style.display = 
                this.value === 'outside' ? 'block' : 'none';
            document.getElementById('foreignCountry').style.display = 
                this.value === 'foreign' ? 'block' : 'none';
        });
    });

    // Q2: Overnight - show/hide nights and accommodation
    document.querySelectorAll('input[name="overnight"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const showFields = this.value === 'yes';
            document.getElementById('nightsCount').style.display = showFields ? 'block' : 'none';
            document.getElementById('accommodationQuestion').style.display = showFields ? 'block' : 'none';
        });
    });

    // Q3: Purpose - show "other" field
    document.querySelectorAll('input[name="purpose"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.getElementById('purposeOther').style.display = 
                this.value === 'other' ? 'block' : 'none';
        });
    });

    // Q6: Currency - show "other" field
    document.getElementById('currency').addEventListener('change', function() {
        document.getElementById('currencyOther').style.display = 
            this.value === 'other' ? 'block' : 'none';
    });

    // Form submission
    document.getElementById('attractionSurveyForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            residence: document.querySelector('input[name="residence"]:checked').value,
            residenceCity: document.getElementById('residenceCity').value,
            residenceProvince: document.getElementById('residenceProvince').value,
            foreignCountry: document.getElementById('foreignCountry').value,
            overnight: document.querySelector('input[name="overnight"]:checked').value,
            nightsCount: document.getElementById('nightsCount').value,
            accommodation: document.querySelector('input[name="accommodation"]:checked')?.value,
            purpose: document.querySelector('input[name="purpose"]:checked').value,
            purposeOther: document.getElementById('purposeOther').value,
            ratings: {
                security: document.querySelector('input[name="rating_security"]:checked').value,
                cleanliness: document.querySelector('input[name="rating_cleanliness"]:checked').value,
                activities: document.querySelector('input[name="rating_activities"]:checked').value,
                staff: document.querySelector('input[name="rating_staff"]:checked').value,
                value: document.querySelector('input[name="rating_value"]:checked').value
            },
            visits: document.querySelector('input[name="visits"]:checked').value,
            currency: document.getElementById('currency').value,
            currencyOther: document.getElementById('currencyOther').value,
            amount: document.getElementById('amount').value,
            persons: document.getElementById('persons').value,
            age: document.getElementById('age').value,
            sex: document.querySelector('input[name="sex"]:checked').value,
            surveyDate: document.getElementById('surveyDate').value,
            attraction: document.getElementById('attraction').value,
            city: document.getElementById('city').value,
            province: document.getElementById('province').value,
            enumerator: document.getElementById('enumerator').value,
            code: document.getElementById('code').value
        };

        try {
            const response = await fetch('/api/surveys/attraction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showToast('Survey submitted successfully!', 'success');
                this.reset();
                navigate('homePage');
            } else {
                showToast('Failed to submit survey', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Error submitting survey', 'error');
        }
    });
});

// Function to collect nationality data from the dynamic form
function collectNationalityData() {
    const nationalityData = [];
    const rows = document.querySelectorAll('.nationality-row');
    
    rows.forEach(row => {
        const select = row.querySelector('.nationality-select');
        const countInput = row.querySelector('.nationality-count');
        
        const nationality = select.value;
        const count = parseInt(countInput.value) || 0;
        
        if (nationality && count > 0) {
            nationalityData.push({
                nationality: nationality,
                count: count
            });
        }
    });
    
    return nationalityData;
}

// Enhanced form submission handler
document.addEventListener('DOMContentLoaded', function() {
    const surveyForm = document.getElementById('attractionSurveyForm');
    
    if (surveyForm) {
        surveyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Collect basic form data
            const formData = new FormData(surveyForm);
            const surveyData = {};
            
            // Convert FormData to object
            formData.forEach((value, key) => {
                surveyData[key] = value;
            });
            
            // Add nationality data if multiple nationalities was selected
            const multipleNationalities = document.querySelector('input[name="multipleNationalities"]:checked');
            if (multipleNationalities && multipleNationalities.value === 'yes') {
                surveyData.nationalities = collectNationalityData();
                surveyData.hasMultipleNationalities = true;
            } else {
                surveyData.hasMultipleNationalities = false;
            }
            
            // Add timestamp
            surveyData.submittedAt = new Date().toISOString();
            
            // Log the data (replace with actual API call)
            console.log('Survey Data:', surveyData);
            
            // Validate nationality data if applicable
            if (surveyData.hasMultipleNationalities && surveyData.nationalities.length === 0) {
                alert('Please add at least one nationality or select "No" for multiple nationalities.');
                return;
            }
            
            // Submit to backend (implement your API endpoint)
            submitSurveyData(surveyData);
        });
    }
});

// Function to submit survey data to backend
async function submitSurveyData(surveyData) {
    try {
        // Show loading indicator
        const submitButton = document.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitButton.disabled = true;
        
        // TODO: Replace with your actual API endpoint
        const response = await fetch('/api/surveys/attraction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(surveyData)
        });
        
        if (response.ok) {
            const result = await response.json();
            
            // Show success message
            alert('Survey submitted successfully! Thank you for your feedback.');
            
            // Reset form
            document.getElementById('attractionSurveyForm').reset();
            hideNationalitySection();
            
            // Navigate back or show confirmation
            if (typeof navigate === 'function') {
                navigate('homePage');
            }
        } else {
            throw new Error('Submission failed');
        }
        
        // Restore button
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        
    } catch (error) {
        console.error('Error submitting survey:', error);
        alert('Failed to submit survey. Please try again.');
        
        // Restore button
        const submitButton = document.querySelector('button[type="submit"]');
        submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Survey';
        submitButton.disabled = false;
    }
}

// Add validation helper
function validateNationalityData() {
    const nationalityData = collectNationalityData();
    const multipleNationalitiesYes = document.querySelector('input[name="multipleNationalities"][value="yes"]');
    
    if (multipleNationalitiesYes && multipleNationalitiesYes.checked) {
        if (nationalityData.length === 0) {
            return {
                valid: false,
                message: 'Please add at least one nationality or select "No".'
            };
        }
        
        // Check for duplicate nationalities
        const nationalities = nationalityData.map(item => item.nationality);
        const uniqueNationalities = new Set(nationalities);
        if (nationalities.length !== uniqueNationalities.size) {
            return {
                valid: false,
                message: 'Duplicate nationalities detected. Please combine them.'
            };
        }
    }
    
    return { valid: true };
}

