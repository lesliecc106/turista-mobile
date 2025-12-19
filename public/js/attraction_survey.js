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
