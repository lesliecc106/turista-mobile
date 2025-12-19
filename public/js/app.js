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
            loadStats();
            break;
        case 'historyPage':
            renderHistoryPage();
            break;
        case 'feedbackPage':
            renderFeedbackPage();
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
        const response = await fetch(`${API_BASE}/api/surveys/stats`);
        const data = await response.json();
        
        document.getElementById('statEstablishments').textContent = data.establishments || 0;
        document.getElementById('statSurveys').textContent = data.surveys || 0;
        document.getElementById('statVisitors').textContent = data.regional || 0;
    } catch (error) {
        console.error('Load stats error:', error);
    }
}

// ==================== SURVEY FORMS ====================
function openSurveyForm(type) {
    if (type === 'attraction') {
        navigate("attractionSurveyPage");
    } else if (type === 'accommodation') {
        showAccommodationForm();
    } else if (type === 'regional') {
        if (currentUser && currentUser.role === 'admin') {
            showRegionalForm();
        } else {
            showToast('Admin access required', 'error');
        }
    }
}

function showAttractionForm {
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

function showRegionalForm() {
    showModal({
        title: 'Regional Distribution Entry',
        body: `
            <form id="regionalForm">
                <div class="form-group">
                    <label><i class="fas fa-globe"></i> Country/Region</label>
                    <select id="reg_origin" required>
                        ${COUNTRIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-hashtag"></i> Visitor Count</label>
                    <input type="number" id="reg_count" min="1" value="1" required>
                </div>
            </form>
        `,
        confirmText: 'Add Entry',
        onConfirm: submitRegionalEntry
    });
}

async function submitRegionalEntry() {
    const formData = {
        origin: document.getElementById('reg_origin').value,
        count: parseInt(document.getElementById('reg_count').value)
    };
    
    try {
        const response = await fetch(`${API_BASE}/api/regional/manual`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showToast('Entry added successfully!', 'success');
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
        const response = await fetch(`${API_BASE}/api/surveys/history/${type}`, {
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
