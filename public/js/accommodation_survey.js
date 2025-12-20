// Accommodation Survey - Conditional Logic and Form Handling

// Global variables
let attractionCounter = 0;
let nationalityCounterAccom = 0;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Accommodation survey logic initialized');

    // Q1: Residence - show/hide conditional fields
    const residenceRadios = document.querySelectorAll('input[name="residence"]');
    residenceRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const outsideGroup = document.getElementById('outsideGroupAccom');
            const foreignCountry = document.getElementById('foreignCountryAccom');
            
            if (outsideGroup) {
                outsideGroup.style.display = this.value === 'outside' ? 'block' : 'none';
            }
            if (foreignCountry) {
                foreignCountry.style.display = this.value === 'foreign' ? 'block' : 'none';
            }
        });
    });

    // Q3: Purpose - show "other" field
    const purposeRadios = document.querySelectorAll('input[name="purposeAccom"]');
    purposeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const purposeOther = document.getElementById('purposeOtherAccom');
            if (purposeOther) {
                purposeOther.style.display = this.value === 'other' ? 'block' : 'none';
            }
        });
    });

    // Q6: Traveling With - show "other" field
    const travelingRadios = document.querySelectorAll('input[name="travelingWith"]');
    travelingRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const travelingOther = document.getElementById('travelingWithOther');
            if (travelingOther) {
                travelingOther.style.display = this.value === 'other' ? 'block' : 'none';
            }
        });
    });

    // Q7: Currency - show "other" field
    const currencySelect = document.getElementById('currencyAccom');
    if (currencySelect) {
        currencySelect.addEventListener('change', function() {
            const currencyOther = document.getElementById('currencyOtherAccom');
            if (currencyOther) {
                currencyOther.style.display = this.value === 'other' ? 'block' : 'none';
            }
        });
    }

    // Q9: Multiple Nationalities - show/hide nationality section
    const nationalityRadios = document.querySelectorAll('input[name="multipleNationalitiesAccom"]');
    nationalityRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const nationalitySection = document.getElementById('nationalitySectionAccom');
            if (nationalitySection) {
                nationalitySection.style.display = this.value === 'yes' ? 'block' : 'none';
            }
        });
    });

    // Form submission
    const surveyForm = document.getElementById('accommodationSurveyForm');
    if (surveyForm) {
        surveyForm.addEventListener('submit', handleAccommodationFormSubmit);
    }
});

// Q4: Add Attraction Row
function addAttractionRow() {
    attractionCounter++;
    const container = document.getElementById('attractionsListAccom');
    
    const rowDiv = document.createElement('div');
    rowDiv.className = 'nationality-row';
    rowDiv.id = `attractionRow${attractionCounter}`;
    
    rowDiv.innerHTML = `
        <input type="text" 
               class="form-input" 
               placeholder="Tourist Attraction Name" 
               id="attraction${attractionCounter}"
               style="flex: 3;">
        <select class="form-select" 
                id="rating${attractionCounter}"
                style="flex: 1; max-width: 100px;">
            <option value="">Rating</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
        </select>
        <button type="button" 
                class="btn-remove-nationality" 
                onclick="removeAttractionRow(${attractionCounter})">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(rowDiv);
}

// Remove Attraction Row
function removeAttractionRow(id) {
    const row = document.getElementById(`attractionRow${id}`);
    if (row) {
        row.remove();
    }
}

// Q9: Add Nationality Row
function addNationalityRowAccom() {
    nationalityCounterAccom++;
    const container = document.getElementById('nationalityListAccom');
    
    const rowDiv = document.createElement('div');
    rowDiv.className = 'nationality-row';
    rowDiv.id = `nationalityRowAccom${nationalityCounterAccom}`;
    
    rowDiv.innerHTML = `
        <select class="nationality-select form-select" style="flex: 2;">
            <option value="">Select Country</option>
            <option value="Philippines">Philippines</option>
            <option value="China">China</option>
            <option value="Japan">Japan</option>
            <option value="South Korea">South Korea</option>
            <option value="United States">United States</option>
            <option value="Thailand">Thailand</option>
            <option value="Malaysia">Malaysia</option>
            <option value="Singapore">Singapore</option>
            <option value="Indonesia">Indonesia</option>
            <option value="Vietnam">Vietnam</option>
            <option value="Australia">Australia</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Germany">Germany</option>
            <option value="France">France</option>
            <option value="Canada">Canada</option>
            <option value="Other">Other (Please specify in count)</option>
        </select>
        <input type="number" 
               class="nationality-count form-input" 
               placeholder="Count" 
               min="1"
               style="flex: 1; max-width: 100px;">
        <button type="button" 
                class="btn-remove-nationality" 
                onclick="removeNationalityRowAccom(${nationalityCounterAccom})">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(rowDiv);
    updateNationalitySummaryAccom();
}

// Remove Nationality Row
function removeNationalityRowAccom(id) {
    const row = document.getElementById(`nationalityRowAccom${id}`);
    if (row) {
        row.remove();
        updateNationalitySummaryAccom();
    }
}

// Update Nationality Summary
function updateNationalitySummaryAccom() {
    const rows = document.querySelectorAll('#nationalityListAccom .nationality-row');
    const summary = document.getElementById('nationalitySummaryAccom');
    const content = document.getElementById('summaryContentAccom');
    
    if (rows.length === 0) {
        summary.style.display = 'none';
        return;
    }
    
    let summaryHTML = '';
    let totalCount = 0;
    
    rows.forEach(row => {
        const select = row.querySelector('.nationality-select');
        const countInput = row.querySelector('.nationality-count');
        
        if (select.value && countInput.value) {
            const count = parseInt(countInput.value) || 0;
            totalCount += count;
            summaryHTML += `
                <div class="nationality-summary-item">
                    <strong>${select.value}:</strong>
                    <span>${count} ${count === 1 ? 'person' : 'people'}</span>
                </div>
            `;
        }
    });
    
    if (summaryHTML) {
        summaryHTML += `
            <div class="nationality-summary-item" style="border-top: 2px solid var(--primary); margin-top: 10px; padding-top: 10px;">
                <strong>Total:</strong>
                <span>${totalCount} ${totalCount === 1 ? 'person' : 'people'}</span>
            </div>
        `;
        content.innerHTML = summaryHTML;
        summary.style.display = 'block';
    } else {
        summary.style.display = 'none';
    }
}

// Collect Attractions Data
function collectAttractionsData() {
    const attractions = [];
    const rows = document.querySelectorAll('#attractionsListAccom .nationality-row');
    
    rows.forEach((row, index) => {
        const nameInput = row.querySelector(`input[id^="attraction"]`);
        const ratingSelect = row.querySelector(`select[id^="rating"]`);
        
        if (nameInput && ratingSelect && nameInput.value && ratingSelect.value) {
            attractions.push({
                name: nameInput.value,
                rating: parseInt(ratingSelect.value)
            });
        }
    });
    
    return attractions;
}

// Collect Nationality Data
function collectNationalityDataAccom() {
    const nationalityRows = [];
    const rows = document.querySelectorAll('#nationalityListAccom .nationality-row');
    
    rows.forEach(row => {
        const select = row.querySelector('.nationality-select');
        const countInput = row.querySelector('.nationality-count');
        
        const nationality = select.value;
        const count = parseInt(countInput.value) || 0;
        
        if (nationality && count > 0) {
            nationalityRows.push({
                nat: nationality,
                count: count
            });
        }
    });
    
    return nationalityRows;
}

// Form Submission Handler
async function handleAccommodationFormSubmit(e) {
    e.preventDefault();
    
    // Collect form data
    const formData = new FormData(e.target);
    const surveyData = {};
    
    for (let [key, value] of formData.entries()) {
        surveyData[key] = value;
    }
    
    // Add attractions data
    surveyData.attractions = collectAttractionsData();
    
    // Add nationality data if applicable
    const multipleNationalities = document.querySelector('input[name="multipleNationalitiesAccom"]:checked');
    if (multipleNationalities && multipleNationalities.value === 'yes') {
        const nationalityRows = collectNationalityDataAccom();
        
        if (nationalityRows.length === 0) {
            alert('Please add at least one nationality with a valid count.');
            return;
        }
        
        surveyData.nationalityRows = nationalityRows;
    } else {
        surveyData.nationalityRows = [];
    }
    
    // Map to backend format
    const apiData = {
        surveyDate: surveyData.surveyDate,
        establishmentName: surveyData.establishmentName,
        aeType: surveyData.aeType,
        numRooms: parseInt(surveyData.numRooms) || 0,
        city: surveyData.city,
        province: surveyData.province,
        enumerator: surveyData.enumerator,
        checkinDate: surveyData.checkinDate,
        checkoutDate: surveyData.checkoutDate,
        purpose: surveyData.purpose || surveyData.purposeOtherAccom || '',
        source: surveyData.source || '',
        roomNights: parseInt(surveyData.roomNights) || 0,
        transport: surveyData.transport || '',
        nationalityRows: surveyData.nationalityRows
    };
    
    console.log("Accommodation Survey Data:", JSON.stringify(apiData, null, 2));
    
    try {
        const response = await fetch('/api/surveys/accommodation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            alert('Survey submitted successfully!');
            e.target.reset();
            
            // Clear dynamic rows
            document.getElementById('attractionsListAccom').innerHTML = '';
            document.getElementById('nationalityListAccom').innerHTML = '';
            document.getElementById('nationalitySectionAccom').style.display = 'none';
            
            attractionCounter = 0;
            nationalityCounterAccom = 0;
            
            // Redirect
            window.location.reload();
        } else {
            throw new Error(result.error || 'Submission failed');
        }
    } catch (error) {
        console.error('Error submitting survey:', error);
        alert('Failed to submit survey. Please try again.');
    }
}
