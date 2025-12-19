// Conditional Logic for Tourism Attraction Survey Form
document.addEventListener('DOMContentLoaded', function() {
    console.log('Conditional logic initialized');

    // Q1: Residence - show/hide follow-up fields
    const residenceRadios = document.querySelectorAll('input[name="residence"]');
    residenceRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const outsideGroup = document.getElementById('outsideGroup');
            const foreignCountry = document.getElementById('foreignCountry');
            
            if (outsideGroup) {
                outsideGroup.style.display = this.value === 'outside' ? 'block' : 'none';
            }
            if (foreignCountry) {
                foreignCountry.style.display = this.value === 'foreign' ? 'block' : 'none';
            }
            
            console.log('Residence changed:', this.value);
        });
    });

    // Q2: Overnight - show/hide nights and accommodation
    const overnightRadios = document.querySelectorAll('input[name="overnight"]');
    overnightRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const nightsCount = document.getElementById('nightsCount');
            const accommodationQuestion = document.getElementById('accommodationQuestion');
            
            const showFields = this.value === 'yes';
            
            if (nightsCount) {
                nightsCount.style.display = showFields ? 'block' : 'none';
            }
            if (accommodationQuestion) {
                accommodationQuestion.style.display = showFields ? 'block' : 'none';
            }
            
            console.log('Overnight changed:', this.value);
        });
    });

    // Q3: Purpose - show "other" field
    const purposeRadios = document.querySelectorAll('input[name="purpose"]');
    purposeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const purposeOther = document.getElementById('purposeOther');
            
            if (purposeOther) {
                purposeOther.style.display = this.value === 'other' ? 'block' : 'none';
            }
            
            console.log('Purpose changed:', this.value);
        });
    });

    // Q6: Currency - show "other" field
    const currencySelect = document.getElementById('currency');
    if (currencySelect) {
        currencySelect.addEventListener('change', function() {
            const currencyOther = document.getElementById('currencyOther');
            
            if (currencyOther) {
                currencyOther.style.display = this.value === 'other' ? 'block' : 'none';
            }
            
            console.log('Currency changed:', this.value);
        });
    }

    console.log('All conditional logic attached successfully!');
});
