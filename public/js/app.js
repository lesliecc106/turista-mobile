// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080' 
    : 'https://backend-production-92c2.up.railway.app';

// Touris-Ta Mobile App - Main Application Logic
// For COMPLETE version with all features, copy Section 11 from document

// ==================== GLOBAL STATE ====================
let currentUser = null;
let currentPage = 'authPage';
const API_BASE = 'https://backend-production-92c2.up.railway.app';

// Country list for nationality selection
const COUNTRIES = [
    "Philippines", "United States", "United Kingdom", "Canada", "Australia", 
    "Japan", "China", "Korea, Republic of", "India", "Indonesia",
    "Malaysia", "Singapore", "Thailand", "Vietnam", "Germany", "France"
];

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    checkSession();
});

function initializeApp() {
    setTimeout(() => {
        document.getElementById('splash').classList.add('hidden');
    }, 3000);
    

    // Hide navigation on initial load (auth page)
    document.body.classList.add('auth-active');
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
}

function setupEventListeners() {
    document.getElementById('menuBtn').addEventListener('click', toggleMenu);
    document.getElementById('menuOverlay').addEventListener('click', closeMenu);
    document.getElementById('notifBtn').addEventListener('click', showNotifications);
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchAuthTab(tab);
        });
    });
    
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const page = e.currentTarget.dataset.page;
            navigate(page);
        });
    });

    // Survey form submissions
    const attractionForm = document.getElementById('attractionForm');
    if (attractionForm) {
        attractionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await submitSurveyForm('attraction', attractionForm);
        });
    }

    const accommodationForm = document.getElementById('accommodationForm');
    if (accommodationForm) {
        accommodationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await submitSurveyForm('accommodation', accommodationForm);
        });
    }



// ==================== SURVEY FORM SUBMISSION ====================
async function submitSurveyForm(surveyType, form) {
    const formData = new FormData(form);
    const data = {};

    // Collect all form fields
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }


    // Map accommodation-specific field names to backend expectations
    if (surveyType === 'accommodation') {
        if (data.purposeAccom) {
            data.purpose = data.purposeAccom;
            delete data.purposeAccom;
        }
    }
    // Map accommodation-specific field names to backend expectations
    if (surveyType === 'accommodation') {
        if (data.purposeAccom) {
            data.purpose = data.purposeAccom;
            delete data.purposeAccom;
        }
    }

    // Collect nationality data
    const nationalityRows = [];
    const selector = surveyType === 'attraction' ? '.nationality-row' : '.nationality-row-accom';
    document.querySelectorAll(selector).forEach(row => {
        const nationality = row.querySelector('select[name="nationality"]')?.value;
        const count = row.querySelector('input[name="nationality_count"]')?.value;
        if (nationality && count) {
            nationalityRows.push({ 
                nat: nationality, 
                count: parseInt(count) 
            });
        }
    });
    data.nationalityRows = nationalityRows;

    // Use the correct endpoint based on survey type
    const endpoint = `${API_BASE}/api/surveys/${surveyType}`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showToast('Survey submitted successfully!', 'success');
            form.reset();
            
            // Reset nationality section
            hideNationalitySection();
            
            navigate('homePage');
        } else {
            const error = await response.json();
            showToast(error.error || 'Failed to submit survey', 'error');
        }
    } catch (error) {
        console.error('Survey submission error:', error);
        showToast('Network error. Please try again.', 'error');
    }
}

// ==================== SURVEY FORM SUBMISSION ====================
async function submitSurveyForm(surveyType, form) {
    const formData = new FormData(form);
    const data = {};

    // Collect all form fields
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }

    // Collect nationality data
    const nationalityRows = [];
    document.querySelectorAll('.nationality-row').forEach(row => {
        const nationality = row.querySelector('select[name="nationality"]')?.value;
        const count = row.querySelector('input[name="nationality_count"]')?.value;
        if (nationality && count) {
            nationalityRows.push({ 
                nat: nationality, 
                count: parseInt(count) 
            });
        }
    });
    data.nationalityRows = nationalityRows;

    // Use the correct endpoint based on survey type
    const endpoint = `${API_BASE}/api/surveys/${surveyType}`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Important for session-based auth
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showToast('Survey submitted successfully!', 'success');
            form.reset();
            
            // Reset nationality section
            hideNationalitySection();
            
            navigate('homePage');
        } else {
            const error = await response.json();
            showToast(error.error || 'Failed to submit survey', 'error');
        }
    } catch (error) {
        console.error('Survey submission error:', error);
        showToast('Network error. Please try again.', 'error');
    }
}


    
    document.getElementById('fab').addEventListener('click', () => navigate('submitPage'));
    document.getElementById('modalClose').addEventListener('click', hideModal);
    document.getElementById('modalCancel').addEventListener('click', hideModal);
}

// ==================== SESSION MANAGEMENT ====================
async function checkSession() {
    try {
        const response = await fetch(`${API_BASE}/api/auth/session`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            onLoginSuccess();
        } else {
            navigate('authPage');
        }
    } catch (error) {
        console.error('Session check failed:', error);
        navigate('authPage');
    }
}

// ==================== AUTHENTICATION ====================
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        showToast('Please enter username and password', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            onLoginSuccess();
            showToast('Login successful!', 'success');
        } else {
            showToast(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Connection error. Please try again.', 'error');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value;
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const role = document.getElementById('signupRole').value;
    
    if (!username || !password || !name) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, name, email, role })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Account created! Awaiting approval.', 'success');
            document.getElementById('signupForm').reset();
            switchAuthTab('login');
        } else {
            showToast(data.error || 'Signup failed', 'error');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showToast('Connection error. Please try again.', 'error');
    }
}

async function handleLogout() {
    try {
        await fetch(`${API_BASE}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        currentUser = null;
        document.body.classList.remove('admin-mode');
        navigate('authPage');
        showToast('Logged out successfully', 'success');
    } catch (error) {
        console.error('Logout error:', error);
    }
}

function onLoginSuccess() {
    document.getElementById('menuUserName').textContent = currentUser.name;
    document.getElementById('menuUserRole').textContent = currentUser.role;
    
    if (currentUser.role === 'admin') {
        document.body.classList.add('admin-mode');
    }
    
    buildMenu();
    loadStats();
    navigate('homePage');
}

function switchAuthTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
    document.getElementById('signupForm').classList.toggle('hidden', tab !== 'signup');
}

// ==================== NAVIGATION ====================
function navigate(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
        targetPage.classList.add('active');

        // Toggle auth-active class for hiding nav elements
        if (pageId === 'authPage') {
            document.body.classList.add('auth-active');
        } else {
            document.body.classList.remove('auth-active');
        }
        currentPage = pageId;
        updateHeaderTitle(pageId);
        
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.page === pageId);
        });
        
        loadPageData(pageId);
    }
    
    closeMenu();
}

function updateHeaderTitle(pageId) {
    const titles = {
        'authPage': { title: 'Touris-Ta', subtitle: 'Tourism Office' },
        'attractionSurveyPage': { title: 'Attraction Survey', subtitle: 'DOT Form' },
        'accommodationSurveyPage': { title: 'Accommodation Survey', subtitle: 'DOT Form' },
        'homePage': { title: 'Home', subtitle: 'Dashboard' },
        'submitPage': { title: 'Submit Survey', subtitle: 'Choose survey type' },
        'dashboardPage': { title: 'Analytics', subtitle: 'Data visualization' },
        'regionalPage': { title: 'Regional Data', subtitle: 'Distribution reports' },
        'historyPage': { title: 'History', subtitle: 'Submission records' },
        'feedbackPage': { title: 'Feedback', subtitle: 'Send your feedback' },
        'reportsPage': { title: 'Reports', subtitle: 'Generate reports' },
        'dataPage': { title: 'Data Manager', subtitle: 'Admin tools' }
    };
    
    const pageTitle = titles[pageId] || titles['homePage'];
    document.getElementById('headerTitle').textContent = pageTitle.title;
    document.getElementById('headerSubtitle').textContent = pageTitle.subtitle;
}

function loadPageData(pageId) {
    switch(pageId) {
        case 'homePage':
            break;
        case 'dashboardPage':
            loadStats();
            break;
        case 'dataPage':
            loadDataManagerPage();
            break;
        case 'historyPage':
            loadHistoryData();
            break;
        case 'feedbackPage':
            renderFeedbackPage();
            break;
        case 'reportsPage':
            loadReportsPage();
            break;
    }
}

// ==================== MENU ====================
function toggleMenu() {
    document.getElementById('sideMenu').classList.toggle('open');
    document.getElementById('menuOverlay').classList.toggle('show');
}

function closeMenu() {
    document.getElementById('sideMenu').classList.remove('open');
    document.getElementById('menuOverlay').classList.remove('show');
}

function buildMenu() {
    const menuNav = document.getElementById('menuNav');
    const isAdmin = currentUser && currentUser.role === 'admin';
    
    const menuItems = [
        { icon: 'fa-home', text: 'Home', page: 'homePage', adminOnly: false },
        { icon: 'fa-chart-line', text: 'Dashboard', page: 'dashboardPage', adminOnly: true },
        { icon: 'fa-plus-circle', text: 'Submit Survey', page: 'submitPage', adminOnly: false },
        { icon: 'fa-globe', text: 'Regional Data', page: 'regionalPage', adminOnly: true },
        { icon: 'fa-chart-bar', text: 'Reports', page: 'reportsPage', adminOnly: true },
        { icon: 'fa-database', text: 'Data Manager', page: 'dataPage', adminOnly: true },
        { icon: 'fa-history', text: 'History', page: 'historyPage', adminOnly: false },
        { icon: 'fa-comment', text: 'Feedback', page: 'feedbackPage', adminOnly: false }
    ];
    
    menuNav.innerHTML = menuItems
        .filter(item => !item.adminOnly || isAdmin)
        .map(item => `
            <button class="menu-item" onclick="navigate('${item.page}')">
                <i class="fas ${item.icon}"></i>
                <span>${item.text}</span>
            </button>
        `).join('');
    
    if (currentUser) {
        menuNav.innerHTML += `
            <button class="menu-item" onclick="handleLogout()">
                <i class="fas fa-sign-out-alt"></i>
                <span>Logout</span>
            </button>
        `;
    }
}

// ==================== STATS ====================
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/api/analytics/dashboard/stats`);
        const data = await response.json();
        
        document.getElementById("statAttractions").textContent = data.attractionSurveys || 0;
        document.getElementById("statAccommodations").textContent = data.accommodationSurveys || 0;
        document.getElementById('statSurveys').textContent = data.totalSurveys || 0;
        document.getElementById('statVisitors').textContent = data.totalVisitors || 0;
    } catch (error) {
        console.error('Load stats error:', error);
    }
}

// ==================== SURVEY FORMS ====================
function openSurveyForm(type) {
    if (type === 'attraction') {
        navigate("attractionSurveyPage");
    } else if (type === 'accommodation') {
        navigate("accommodationSurveyPage");
    } else if (type === 'regional') {
        if (currentUser && currentUser.role === 'admin') {
            navigate("regionalPage");
        } else {
            showToast('Admin access required', 'error');
        }
    }
}

function showAttractionForm() {
    const today = new Date().toISOString().split('T')[0];
    
    showModal({
        title: 'Tourism Attraction Survey',
        body: `
            <form id="attractionForm">
                <div class="form-group">
                    <label><i class="fas fa-calendar"></i> Survey Date</label>
                    <input type="date" id="attr_survey_date" value="${today}" required>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-mountain"></i> Attraction Name</label>
                    <input type="text" id="attr_name" placeholder="e.g., Mt. Iriga" required>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-map-marker-alt"></i> City</label>
                    <input type="text" id="attr_city" value="Iriga City" required>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-calendar-day"></i> Visit Date</label>
                    <input type="date" id="attr_visit_date" value="${today}" required>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-home"></i> Place of Residence</label>
                    <select id="attr_residence" required>
                        <option>In this City / Municipality</option>
                        <option>Outside the Municipality but within the Province</option>
                        <option>Outside the Province but within the Region</option>
                        <option>Outside the Region but within the Country</option>
                        <option>Foreign Country</option>
                    </select>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-bullseye"></i> Purpose of Visit</label>
                    <select id="attr_purpose" required>
                        <option>Leisure / Recreation / Holiday</option>
                        <option>Visiting Friends / Relatives</option>
                        <option>Business / Professional</option>
                        <option>Religious / Pilgrimage</option>
                        <option>Educational / Training</option>
                        <option>Health / Medical</option>
                        <option>Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-car"></i> Transportation</label>
                    <select id="attr_transport" required>
                        <option>Private Vehicle</option>
                        <option>Public Transportation</option>
                        <option>Motorcycle</option>
                        <option>Bicycle</option>
                        <option>On Foot</option>
                        <option>Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-users"></i> Group Size</label>
                    <input type="number" id="attr_group_size" min="1" value="1" required>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-flag"></i> Nationality</label>
                    <select id="attr_nationality" required>
                        ${COUNTRIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-hashtag"></i> Number of Persons</label>
                    <input type="number" id="attr_count" min="1" value="1" required>
                </div>
            </form>
        `,
        confirmText: 'Submit Survey',
        onConfirm: submitAttractionSurvey
    });
}

async function submitAttractionSurvey() {
    const formData = {
        surveyDate: document.getElementById('attr_survey_date').value,
        attractionName: document.getElementById('attr_name').value,
        city: document.getElementById('attr_city').value,
        province: 'Camarines Sur',
        code: '',
        enumerator: currentUser.name,
        visitDate: document.getElementById('attr_visit_date').value,
        residence: document.getElementById('attr_residence').value,
        purpose: document.getElementById('attr_purpose').value,
        transport: document.getElementById('attr_transport').value,
        groupSize: parseInt(document.getElementById('attr_group_size').value),
        stay: 'Day Trip',
        nationalityRows: [{
            nat: document.getElementById('attr_nationality').value,
            count: parseInt(document.getElementById('attr_count').value)
        }]
    };
    
    try {
        const response = await fetch(`${API_BASE}/api/surveys/attraction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showToast('Survey submitted successfully!', 'success');
            hideModal();
            loadStats();
        } else {
            const data = await response.json();
            showToast(data.error || 'Submission failed', 'error');
        }
    } catch (error) {
        console.error('Submit error:', error);
        showToast('Connection error', 'error');
    }
}

function showAccommodationForm() {
    const today = new Date().toISOString().split('T')[0];
    
    showModal({
        title: 'Accommodation Survey',
        body: `
            <form id="accommodationForm">
                <div class="form-group">
                    <label><i class="fas fa-calendar"></i> Survey Date</label>
                    <input type="date" id="ae_survey_date" value="${today}" required>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-hotel"></i> Establishment Name</label>
                    <input type="text" id="ae_name" placeholder="Hotel/Resort name" required>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-building"></i> Type</label>
                    <select id="ae_type" required>
                        <option>Hotel</option>
                        <option>Resort</option>
                        <option>Inn</option>
                        <option>Pension House</option>
                        <option>Bed and Breakfast</option>
                        <option>Hostel</option>
                        <option>Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-door-open"></i> Number of Rooms</label>
                    <input type="number" id="ae_rooms" min="1" required>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-calendar-check"></i> Check-in Date</label>
                    <input type="date" id="ae_checkin" value="${today}" required>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-calendar-times"></i> Check-out Date</label>
                    <input type="date" id="ae_checkout" value="${today}" required>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-bullseye"></i> Purpose</label>
                    <select id="ae_purpose" required>
                        <option>Leisure / Recreation / Holiday</option>
                        <option>Business / Professional</option>
                        <option>Conference / Convention</option>
                        <option>Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-flag"></i> Nationality</label>
                    <select id="ae_nationality" required>
                        ${COUNTRIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-hashtag"></i> Number of Persons</label>
                    <input type="number" id="ae_count" min="1" value="1" required>
                </div>
            </form>
        `,
        confirmText: 'Submit Survey',
        onConfirm: submitAccommodationSurvey
    });
}

async function submitAccommodationSurvey() {
    const formData = {
        surveyDate: document.getElementById('ae_survey_date').value,
        establishmentName: document.getElementById('ae_name').value,
        aeType: document.getElementById('ae_type').value,
        numRooms: parseInt(document.getElementById('ae_rooms').value),
        city: 'Iriga City',
        province: 'Camarines Sur',
        enumerator: currentUser.name,
        checkinDate: document.getElementById('ae_checkin').value,
        checkoutDate: document.getElementById('ae_checkout').value,
        purpose: document.getElementById('ae_purpose').value,
        source: 'Direct',
        roomNights: 1,
        transport: 'Private Vehicle',
        nationalityRows: [{
            nat: document.getElementById('ae_nationality').value,
            count: parseInt(document.getElementById('ae_count').value)
        }]
    };
    
    try {
        const response = await fetch(`${API_BASE}/api/surveys/accommodation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showToast('Survey submitted successfully!', 'success');
            hideModal();
            loadStats();
        } else {
            const data = await response.json();
            showToast(data.error || 'Submission failed', 'error');
        }
    } catch (error) {
        console.error('Submit error:', error);
        showToast('Connection error', 'error');
    }
}


// ==================== HISTORY PAGE ====================
function renderHistoryPage() {
    const historyPage = document.getElementById('historyPage');
    
    historyPage.innerHTML = `
        <div class="card">
            <h3 class="card-title">Submission History</h3>
            <div class="action-grid">
                <button class="action-btn" onclick="loadHistory('attractions')">
                    <i class="fas fa-mountain"></i>
                    <span>Attractions</span>
                </button>
                <button class="action-btn" onclick="loadHistory('accommodations')">
                    <i class="fas fa-hotel"></i>
                    <span>Accommodations</span>
                </button>
            </div>
        </div>
        <div id="historyContent"></div>
    `;
}

async function loadHistory(type) {
    try {
        const response = await fetch(`${API_BASE}/api/analytics/history`, {
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to load history');
        
        const data = await response.json();
        renderHistoryContent(type, data);
    } catch (error) {
        console.error('Load history error:', error);
        showToast('Failed to load history', 'error');
    }
}

function renderHistoryContent(type, data) {
    const container = document.getElementById('historyContent');
    
    if (!data || data.length === 0) {
        container.innerHTML = `
            <div class="card" style="text-align: center;">
                <i class="fas fa-inbox" style="font-size: 48px; color: var(--text-muted); margin-bottom: 16px;"></i>
                <p style="color: var(--text-secondary);">No ${type} records found</p>
            </div>
        `;
        return;
    }
    
    if (type === 'attractions') {
        container.innerHTML = data.map(item => `
            <div class="card">
                <h4 style="margin: 0 0 8px;">${escapeHtml(item.attraction_name)}</h4>
                <p style="color: var(--text-secondary); font-size: 14px; margin: 0 0 8px;">
                    <i class="fas fa-map-marker-alt"></i> ${escapeHtml(item.city)}
                </p>
                <p style="color: var(--text-secondary); font-size: 14px; margin: 0;">
                    <i class="fas fa-calendar"></i> ${formatDate(item.survey_date)} | 
                    <i class="fas fa-user"></i> ${escapeHtml(item.owner)}
                </p>
            </div>
        `).join('');
    } else if (type === 'accommodations') {
        container.innerHTML = data.map(item => `
            <div class="card">
                <h4 style="margin: 0 0 8px;">${escapeHtml(item.establishment_name)}</h4>
                <p style="color: var(--text-secondary); font-size: 14px; margin: 0 0 8px;">
                    <i class="fas fa-building"></i> ${escapeHtml(item.ae_type)}
                </p>
                <p style="color: var(--text-secondary); font-size: 14px; margin: 0;">
                    <i class="fas fa-calendar"></i> ${formatDate(item.survey_date)} | 
                    <i class="fas fa-user"></i> ${escapeHtml(item.owner)}
                </p>
            </div>
        `).join('');
    }
}

// ==================== FEEDBACK PAGE ====================
function renderFeedbackPage() {
    const feedbackPage = document.getElementById('feedbackPage');
    
    feedbackPage.innerHTML = `
        <div class="card">
            <h3 class="card-title">Send Feedback</h3>
            <form id="feedbackForm">
                <div class="form-group">
                    <label><i class="fas fa-user"></i> Your Name (optional)</label>
                    <input type="text" id="fb_name" placeholder="Your name" value="${currentUser ? currentUser.name : ''}">
                </div>
                <div class="form-group">
                    <label><i class="fas fa-comment"></i> Message</label>
                    <textarea id="fb_message" rows="6" placeholder="Share your feedback..." required style="resize: vertical; width: 100%; padding: 14px; border: 2px solid var(--border); border-radius: var(--radius); background: var(--bg-secondary);"></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-block">
                    <i class="fas fa-paper-plane"></i> Send Feedback
                </button>
            </form>
        </div>
    `;
    
    document.getElementById('feedbackForm').addEventListener('submit', submitFeedback);
}

async function submitFeedback(e) {
    e.preventDefault();
    
    const name = document.getElementById('fb_name').value.trim() || 'Anonymous';
    const message = document.getElementById('fb_message').value.trim();
    
    if (!message) {
        showToast('Please enter a message', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/admin/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, message })
        });
        
        if (response.ok) {
            showToast('Feedback sent successfully!', 'success');
            document.getElementById('fb_message').value = '';
        } else {
            showToast('Failed to send feedback', 'error');
        }
    } catch (error) {
        console.error('Submit feedback error:', error);
        showToast('Connection error', 'error');
    }
}

async function showNotifications() {
    showToast('No new notifications', 'info');
}

// ==================== THEME ====================
function toggleTheme() {
    const toggle = document.getElementById('themeToggle');
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    setTheme(newTheme);
    toggle.classList.toggle('active');
}

function setTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('themeToggle').classList.add('active');
    } else {
        document.documentElement.removeAttribute('data-theme');
        document.getElementById('themeToggle').classList.remove('active');
    }
    localStorage.setItem('theme', theme);
}

// ==================== MODAL ====================
let currentModal = null;

function showModal(options) {
    const modal = document.getElementById('modal');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');
    const confirm = document.getElementById('modalConfirm');
    const cancel = document.getElementById('modalCancel');
    
    title.textContent = options.title || 'Modal';
    body.innerHTML = options.body || '';
    confirm.textContent = options.confirmText || 'Confirm';
    cancel.textContent = options.cancelText || 'Cancel';
    
    currentModal = options;
    
    confirm.onclick = () => {
        if (options.onConfirm) options.onConfirm();
        else hideModal();
    };
    
    modal.classList.add('show');
}

function hideModal() {
    document.getElementById('modal').classList.remove('show');
    currentModal = null;
}

// ==================== TOAST ====================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span>${escapeHtml(message)}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==================== UTILITY FUNCTIONS ====================
function escapeHtml(str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ==================== CONSOLE LOG ====================
console.log('🚀 Touris-Ta Mobile App Initialized');
console.log('📱 Version: 2.0 (Mobile Edition)');
console.log('🏛️ Iriga City Tourism Office');
console.log('');
console.log('NOTE: For COMPLETE version with all features,');
console.log('copy Section 11 from the document to this file.');

// Multiple Nationalities Feature
let nationalityCount = 0;
const nationalityData = [];

function addNationalityRow() {
    nationalityCount++;
    const nationalityList = document.getElementById('nationalityList');
    
    const row = document.createElement('div');
    row.className = 'nationality-row';
    row.id = `nationality-row-${nationalityCount}`;
    
    row.innerHTML = `
        <div class="nationality-input-group">
            <select class="nationality-select" id="nationality-${nationalityCount}" onchange="updateNationalitySummary()">
                <option value="">Select Country</option>
                <option value="Philippines">Philippines</option>
                <option value="United States">United States</option>
                <option value="China">China</option>
                <option value="Japan">Japan</option>
                <option value="South Korea">South Korea</option>
                <option value="Australia">Australia</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Singapore">Singapore</option>
                <option value="Malaysia">Malaysia</option>
                <option value="Indonesia">Indonesia</option>
                <option value="Thailand">Thailand</option>
                <option value="Vietnam">Vietnam</option>
                <option value="India">India</option>
                <option value="Taiwan">Taiwan</option>
                <option value="Hong Kong">Hong Kong</option>
                <option value="Other">Other</option>
            </select>
            
            <input type="number" 
                   class="nationality-count" 
                   id="count-${nationalityCount}" 
                   placeholder="Number of people"
                   min="1"
                   onchange="updateNationalitySummary()">
            
            <button type="button" 
                    class="btn-remove-nationality" 
                    onclick="removeNationalityRow(${nationalityCount})"
                    title="Remove">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    nationalityList.appendChild(row);
    updateNationalitySummary();
}

function removeNationalityRow(id) {
    const row = document.getElementById(`nationality-row-${id}`);
    if (row) {
        row.remove();
        updateNationalitySummary();
    }
}

function updateNationalitySummary() {
    const rows = document.querySelectorAll('.nationality-row');
    const summary = {};
    let totalPeople = 0;
    
    rows.forEach(row => {
        const select = row.querySelector('.nationality-select');
        const countInput = row.querySelector('.nationality-count');
        
        const nationality = select.value;
        const count = parseInt(countInput.value) || 0;
        
        if (nationality && count > 0) {
            summary[nationality] = (summary[nationality] || 0) + count;
            totalPeople += count;
        }
    });
    
    const summaryDiv = document.getElementById('nationalitySummary');
    const summaryContent = document.getElementById('summaryContent');
    
    if (Object.keys(summary).length > 0) {
        summaryDiv.style.display = 'block';
        let html = `<p><strong>Total People: ${totalPeople}</strong></p><ul>`;
        
        for (const [nationality, count] of Object.entries(summary)) {
            html += `<li>${nationality}: ${count} ${count === 1 ? 'person' : 'people'}</li>`;
        }
        
        html += '</ul>';
        summaryContent.innerHTML = html;
    } else {
        summaryDiv.style.display = 'none';
    }
}

function showNationalitySection() {
    const section = document.getElementById('nationalitySection');
    section.style.display = 'block';
    
    // Add first row automatically
    if (nationalityCount === 0) {
        addNationalityRow();
    }
}

function hideNationalitySection() {
    const section = document.getElementById('nationalitySection');
    section.style.display = 'none';
    
    // Clear all rows
    const nationalityList = document.getElementById('nationalityList');
    nationalityList.innerHTML = '';
    nationalityCount = 0;
    updateNationalitySummary();
}

// Call this when "Yes" is selected for multiple nationalities question
function handleMultipleNationalitiesChange(value) {
    if (value === 'yes') {
        showNationalitySection();
    } else {
        hideNationalitySection();
    }
}


// Add validation before form submission
function validateSurveyForm() {
    // Validate nationality section if visible
    const nationalitySection = document.getElementById('nationalitySection');
    if (nationalitySection && nationalitySection.style.display !== 'none') {
        const rows = document.querySelectorAll('.nationality-row');
        let hasValidRow = false;
        
        rows.forEach(row => {
            const select = row.querySelector('.nationality-select');
            const countInput = row.querySelector('.nationality-count');
            
            if (select.value && countInput.value && countInput.value > 0) {
                hasValidRow = true;
            }
        });
        
        if (!hasValidRow) {
            alert('Please add at least one nationality with a valid count, or select "No" for multiple nationalities.');
            return false;
        }
    }
    
    return true;
}

// Export nationality data for API submission
function getNationalityDataForSubmission() {
    const multipleNationalities = document.querySelector('input[name="multipleNationalities"]:checked');
    
    if (!multipleNationalities || multipleNationalities.value !== 'yes') {
        return null;
    }
    
    const rows = document.querySelectorAll('.nationality-row');
    const nationalityData = [];
    
    rows.forEach(row => {
        const select = row.querySelector('.nationality-select');
        const countInput = row.querySelector('.nationality-count');
        
        if (select.value && countInput.value && countInput.value > 0) {
            nationalityData.push({
                nationality: select.value,
                count: parseInt(countInput.value)
            });
        }
    });
    
    return nationalityData;
}


// ==================== REGIONAL DISTRIBUTION FORM ====================
// Auto-calculate subtotals and totals for regional distribution form
function setupRegionalFormCalculations() {

// ==================== REGIONAL SPREADSHEET ====================
const COUNTRY_GROUPS = {
    'Philippine Residents': [
        'Provincial Residents',
        'Regional Residents (Non-Provincial)',
        'Regional Residents (Provincial)'
    ],
    'EAST ASIA': [
        'China', 'Cambodia', 'Indonesia', 'Laos', 'Malaysia', 
        'Myanmar', 'Singapore', 'Thailand', 'Vietnam'
    ],
    'ASIA': [
        'Japan', 'Hong Kong', 'Taiwan', 'Korea'
    ],
    'SOUTH ASIA': [
        'Bangladesh', 'India', 'Iran', 'Nepal', 'Pakistan', 'Sri Lanka'
    ],
    'OCEANIA': [
        'Australia', 'New Zealand', 'Papua New Guinea'
    ],
    'AFRICA': [
        'Nigeria', 'South Africa'
    ],
    'MIDDLE EAST': [
        'Saudi Arabia', 'United Arab Emirates', 'Israel'
    ],
    'EUROPE': [
        'United Kingdom', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands'
    ],
    'AMERICAS': [
        'United States', 'Canada', 'Brazil', 'Mexico'
    ]
};

    const tbody = document.getElementById('distributionTableBody');
    let html = '';
    
    Object.entries(COUNTRY_GROUPS).forEach(([groupName, countries]) => {
        // Group header
        html += `<tr class="country-group-header">
            <td colspan="14">${groupName}</td>
        </tr>`;
        
        // Country rows
        countries.forEach(country => {
            const countryId = country.toLowerCase().replace(/[^a-z0-9]/g, '_');
            html += `<tr class="country-row">
                <td class="country-col">${country}</td>`;
            
            // Month columns (Jan-Dec)
            for (let month = 1; month <= 12; month++) {
                const monthStr = month.toString().padStart(2, '0');
                html += `<td><input type="number" min="0" value="0" 
                    class="table-input country-input" 
                    data-country="${countryId}" 
                    data-month="${monthStr}"></td>`;
            }
            
            // Total column
            html += `<td class="total-col" id="total_${countryId}">0</td>
            </tr>`;
        });
        
        // Subtotal row
        const groupId = groupName.toLowerCase().replace(/[^a-z0-9]/g, '_');
        html += `<tr class="subtotal-row">
            <td class="country-col">Sub-Total (${groupName})</td>`;
        
        for (let month = 1; month <= 12; month++) {
            const monthStr = month.toString().padStart(2, '0');
            html += `<td id="subtotal_${groupId}_${monthStr}">0</td>`;
        }
        
        html += `<td class="total-col" id="subtotal_${groupId}_total">0</td>
        </tr>`;
    });
    
    // Other and unspecified
    html += `<tr class="country-row">
        <td class="country-col">Other and Unspecified Residence</td>`;
    for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, '0');
        html += `<td><input type="number" min="0" value="0" 
            class="table-input country-input" 
            data-country="other" 
            data-month="${monthStr}"></td>`;
    }
    html += `<td class="total-col" id="total_other">0</td></tr>`;
    
    // Overseas Filipinos
    html += `<tr class="country-row">
        <td class="country-col">Overseas Filipinos*</td>`;
    for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, '0');
        html += `<td><input type="number" min="0" value="0" 
            class="table-input country-input" 
            data-country="overseas_filipinos" 
            data-month="${monthStr}"></td>`;
    }
    html += `<td class="total-col" id="total_overseas_filipinos">0</td></tr>`;
    
    // Grand totals
    html += `<tr class="grand-total-row">
        <td class="country-col">GRAND TOTAL GUEST ARRIVALS</td>`;
    for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, '0');
        html += `<td id="grand_total_${monthStr}">0</td>`;
    }
    html += `<td class="total-col" id="grand_total_year">0</td></tr>`;
    
    tbody.innerHTML = html;
    
    // Add event listeners for auto-calculation
    document.querySelectorAll('.country-input').forEach(input => {
        input.addEventListener('input', calculateRegionalTotals);
    });
    
    // Add event listeners for occupancy calculations
    document.querySelectorAll('.table-input[data-metric]').forEach(input => {
        input.addEventListener('input', calculateOccupancy);
    });
}

function calculateRegionalTotals() {
    // Calculate row totals
    document.querySelectorAll('.country-row').forEach(row => {
        const inputs = row.querySelectorAll('.country-input');
        if (inputs.length > 0) {
            const country = inputs[0].dataset.country;
            let rowTotal = 0;
            
            inputs.forEach(input => {
                rowTotal += parseInt(input.value) || 0;
            });
            
            const totalCell = document.getElementById(`total_${country}`);
            if (totalCell) totalCell.textContent = rowTotal;
        }
    });
    
    // Calculate group subtotals
    Object.entries(COUNTRY_GROUPS).forEach(([groupName, countries]) => {
        const groupId = groupName.toLowerCase().replace(/[^a-z0-9]/g, '_');
        
        for (let month = 1; month <= 12; month++) {
            const monthStr = month.toString().padStart(2, '0');
            let monthTotal = 0;
            
            countries.forEach(country => {
                const countryId = country.toLowerCase().replace(/[^a-z0-9]/g, '_');
                const input = document.querySelector(
                    `.country-input[data-country="${countryId}"][data-month="${monthStr}"]`
                );
                monthTotal += parseInt(input?.value) || 0;
            });
            
            const subtotalCell = document.getElementById(`subtotal_${groupId}_${monthStr}`);
            if (subtotalCell) subtotalCell.textContent = monthTotal;
        }
        
        // Calculate group total
        let groupTotal = 0;
        for (let month = 1; month <= 12; month++) {
            const monthStr = month.toString().padStart(2, '0');
            const subtotalCell = document.getElementById(`subtotal_${groupId}_${monthStr}`);
            groupTotal += parseInt(subtotalCell?.textContent) || 0;
        }
        
        const groupTotalCell = document.getElementById(`subtotal_${groupId}_total`);
        if (groupTotalCell) groupTotalCell.textContent = groupTotal;
    });
    
    // Calculate grand totals
    for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, '0');
        const allInputs = document.querySelectorAll(`.country-input[data-month="${monthStr}"]`);
        let monthTotal = 0;
        
        allInputs.forEach(input => {
            monthTotal += parseInt(input.value) || 0;
        });
        
        const grandTotalCell = document.getElementById(`grand_total_${monthStr}`);
        if (grandTotalCell) grandTotalCell.textContent = monthTotal;
    }
    
    // Calculate year total
    let yearTotal = 0;
    for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, '0');
        const grandTotalCell = document.getElementById(`grand_total_${monthStr}`);
        yearTotal += parseInt(grandTotalCell?.textContent) || 0;
    }
    
    const yearTotalCell = document.getElementById('grand_total_year');
    if (yearTotalCell) yearTotalCell.textContent = yearTotal;
}

function calculateOccupancy() {
    for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, '0');
        
        const occupiedInput = document.querySelector(
            `.table-input[data-metric="rooms_occupied"][data-month="${monthStr}"]`
        );
        const availableInput = document.querySelector(
            `.table-input[data-metric="rooms_available"][data-month="${monthStr}"]`
        );
        
        const occupied = parseInt(occupiedInput?.value) || 0;
        const available = parseInt(availableInput?.value) || 0;
        
        const occupancyCell = document.getElementById(`occupancy_${monthStr}`);
        
        if (available > 0) {
            const rate = (occupied / available) * 100;
            if (occupancyCell) occupancyCell.textContent = rate.toFixed(2);
        } else {
            if (occupancyCell) occupancyCell.textContent = '0.00';
        }
    }
}

async function loadRegionalData() {
    const city = document.getElementById('report_city').value;
    const province = document.getElementById('report_province').value;
    const year = document.getElementById('report_year').value;
    
    try {
        const response = await fetch(`${API_BASE}/api/analytics/regional-data?city=${city}&province=${province}&year=${year}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            populateRegionalData(data);
            showToast('Data loaded successfully', 'success');
        } else {
            showToast('No data found for this period', 'info');
        }
    } catch (error) {
        console.error('Load error:', error);
        showToast('Failed to load data', 'error');
    }
}

function populateRegionalData(data) {
    // Populate distribution data
    if (data.distribution) {
        Object.entries(data.distribution).forEach(([country, months]) => {
            Object.entries(months).forEach(([month, value]) => {
                const input = document.querySelector(
                    `.country-input[data-country="${country}"][data-month="${month}"]`
                );
                if (input) input.value = value;
            });
        });
    }
    
    // Populate occupancy data
    if (data.occupancy) {
        ['rooms_occupied', 'rooms_available', 'room_nights', 'length_of_stay'].forEach(metric => {
            if (data.occupancy[metric]) {
                Object.entries(data.occupancy[metric]).forEach(([month, value]) => {
                    const input = document.querySelector(
                        `.table-input[data-metric="${metric}"][data-month="${month}"]`
                    );
                    if (input) input.value = value;
                });
            }
        });
    }
    
    calculateRegionalTotals();
    calculateOccupancy();
}

async function saveRegionalData() {
    const city = document.getElementById('report_city').value;
    const province = document.getElementById('report_province').value;
    const year = document.getElementById('report_year').value;
    
    // Collect all distribution data
    const distribution = {};
    document.querySelectorAll('.country-input').forEach(input => {
        const country = input.dataset.country;
        const month = input.dataset.month;
        const value = parseInt(input.value) || 0;
        
        if (!distribution[country]) distribution[country] = {};
        distribution[country][month] = value;
    });
    
    // Collect occupancy data
    const occupancy = {
        rooms_occupied: {},
        rooms_available: {},
        room_nights: {},
        length_of_stay: {}
    };
    
    document.querySelectorAll('.table-input[data-metric]').forEach(input => {
        const metric = input.dataset.metric;
        const month = input.dataset.month;
        const value = parseFloat(input.value) || 0;
        
        if (occupancy[metric]) {
            occupancy[metric][month] = value;
        }
    });
    
    const dataToSave = {
        city,
        province,
        year,
        distribution,
        occupancy,
        updated_at: new Date().toISOString()
    };
    
    try {
        const response = await fetch(`${API_BASE}/api/analytics/regional-data/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(dataToSave)
        });
        
        if (response.ok) {
            showToast('Data saved successfully!', 'success');
        } else {
            const error = await response.json();
            showToast(error.message || 'Failed to save data', 'error');
        }
    } catch (error) {
        console.error('Save error:', error);
        showToast('Network error. Please try again.', 'error');
    }
}

// Initialize regional page
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('regionalPage')) {
        calculateRegionalTotals();
        calculateOccupancy();
    }
});

// ==================== DATA MANAGER FUNCTIONS ====================

// Load Data Manager page
async function loadDataManagerPage() {
    if (!currentUser || currentUser.role !== 'admin') {
        showNotification('Access denied. Admin only.', 'error');
        navigate('homePage');
        return;
    }
    
    await loadPendingApprovals();
    await loadAllUsers();
    await loadFeedback();
}

// Load pending approvals
async function loadPendingApprovals() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/pending`, {
            headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
        });
        
        if (!response.ok) throw new Error('Failed to load pending approvals');
        
        const pending = await response.json();
        const container = document.getElementById('pendingApprovals');
        const countBadge = document.getElementById('pendingCount');
        
        countBadge.textContent = pending.length;
        
        if (pending.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#999;">No pending approvals</p>';
            return;
        }
        
        container.innerHTML = pending.map(user => `
            <div class="approval-card">
                <h4><i class="fas fa-user"></i> ${user.name || user.username}</h4>
                <div class="approval-info">
                    <p><strong>Username:</strong> ${user.username}</p>
                    <p><strong>Role:</strong> ${user.role}</p>
                    <p><strong>Registered:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                <div class="approval-actions">
                    <button class="btn-success" onclick="approveUser('${user._id}')">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn-danger" onclick="rejectUser('${user._id}')">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading pending approvals:', error);
        showNotification('Failed to load pending approvals', 'error');
    }
}

// Approve user
async function approveUser(userId) {
    if (!confirm('Approve this user account?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}/approve`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
        });
        
        if (!response.ok) throw new Error('Failed to approve user');
        
        showNotification('User approved successfully', 'success');
        await loadPendingApprovals();
        await loadAllUsers();
    } catch (error) {
        console.error('Error approving user:', error);
        showNotification('Failed to approve user', 'error');
    }
}

// Reject user
async function rejectUser(userId) {
    if (!confirm('Reject this user account? This will delete their account.')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}/reject`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
        });
        
        if (!response.ok) throw new Error('Failed to reject user');
        
        showNotification('User rejected successfully', 'success');
        await loadPendingApprovals();
    } catch (error) {
        console.error('Error rejecting user:', error);
        showNotification('Failed to reject user', 'error');
    }
}

// Load all users
async function loadAllUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users`, {
            headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
        });
        
        if (!response.ok) throw new Error('Failed to load users');
        
        const users = await response.json();
        const tbody = document.getElementById('usersTableBody');
        
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999;">No users found</td></tr>';
            return;
        }
        
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.username}</td>
                <td>${user.name || 'N/A'}</td>
                <td><i class="fas fa-user-tag"></i> ${user.role}</td>
                <td>
                    <span class="status-badge status-${user.status}">
                        ${user.status}
                    </span>
                </td>
                <td>
                    <button class="btn-danger" onclick="deleteUser('${user._id}', '${user.username}')" 
                            ${user.role === 'admin' ? 'disabled' : ''}>
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading users:', error);
        showNotification('Failed to load users', 'error');
    }
}

// Delete user
async function deleteUser(userId, username) {
    if (!confirm(`Delete user "${username}"? This action cannot be undone.`)) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
        });
        
        if (!response.ok) throw new Error('Failed to delete user');
        
        showNotification('User deleted successfully', 'success');
        await loadAllUsers();
    } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('Failed to delete user', 'error');
    }
}

// Refresh users
async function refreshUsers() {
    await loadAllUsers();
    showNotification('Users refreshed', 'success');
}

// Create account form submission
document.addEventListener('DOMContentLoaded', () => {
    const createForm = document.getElementById('createAccountForm');
    if (createForm) {
        createForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const accountData = {
                name: formData.get('fullName'),
                username: formData.get('username'),
                password: formData.get('password'),
                role: formData.get('role'),
                status: 'approved' // Admin-created accounts are pre-approved
            };
            
            try {
                const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                    },
                    body: JSON.stringify(accountData)
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to create account');
                }
                
                showNotification('Account created successfully', 'success');
                e.target.reset();
                await loadAllUsers();
            } catch (error) {
                console.error('Error creating account:', error);
                showNotification(error.message, 'error');
            }
        });
    }
});

// Load feedback
async function loadFeedback() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/feedback`, {
            headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
        });
        
        if (!response.ok) throw new Error('Failed to load feedback');
        
        const feedbackList = await response.json();
        const container = document.getElementById('feedbackList');
        const countBadge = document.getElementById('feedbackCount');
        
        countBadge.textContent = feedbackList.length;
        
        if (feedbackList.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#999;">No feedback yet</p>';
            return;
        }
        
        container.innerHTML = feedbackList.map(fb => `
            <div class="feedback-item">
                <div class="feedback-header">
                    <span class="feedback-user">
                        <i class="fas fa-user"></i> ${fb.userName || fb.userEmail}
                    </span>
                    <span class="feedback-date">${new Date(fb.createdAt).toLocaleString()}</span>
                </div>
                <div class="feedback-message">${fb.message}</div>
                ${fb.reply ? `
                    <div class="feedback-reply">
                        <strong>Admin Reply:</strong> ${fb.reply}
                    </div>
                ` : `
                    <button class="btn-primary" onclick="replyToFeedback('${fb._id}')">
                        <i class="fas fa-reply"></i> Reply
                    </button>
                `}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading feedback:', error);
        showNotification('Failed to load feedback', 'error');
    }
}

// Reply to feedback
async function replyToFeedback(feedbackId) {
    const reply = prompt('Enter your reply:');
    if (!reply) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/feedback/${feedbackId}/reply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            },
            body: JSON.stringify({ reply })
        });
        
        if (!response.ok) throw new Error('Failed to send reply');
        
        showNotification('Reply sent successfully', 'success');
        await loadFeedback();
    } catch (error) {
        console.error('Error replying to feedback:', error);
        showNotification('Failed to send reply', 'error');
    }
}

