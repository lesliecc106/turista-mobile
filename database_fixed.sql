
-- Connect to database

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Admin Accounts (passwords: AdminPass01, AdminPass02, AdminPass03)
INSERT INTO users (username, password, name, email, role, status) VALUES
('admin01', 'AdminPass01', 'Tourism Admin 1', 'admin1@iriga.gov.ph', 'admin', 'approved'),
('admin02', 'AdminPass02', 'Tourism Admin 2', 'admin2@iriga.gov.ph', 'admin', 'approved'),
('admin03', 'AdminPass03', 'Tourism Admin 3', 'admin3@iriga.gov.ph', 'admin', 'approved');

-- Establishments Table
CREATE TABLE establishments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner VARCHAR(100) NOT NULL,
    contact VARCHAR(100),
    address TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attraction Surveys Table
CREATE TABLE attraction_surveys (
    id SERIAL PRIMARY KEY,
    survey_date DATE NOT NULL,
    attraction_name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    province VARCHAR(100),
    code VARCHAR(100),
    enumerator VARCHAR(255),
    visit_date DATE,
    residence VARCHAR(255),
    purpose VARCHAR(255),
    transport VARCHAR(255),
    group_size INTEGER,
    stay VARCHAR(255),
    nationality_data JSONB,
    owner VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accommodation Surveys Table
CREATE TABLE accommodation_surveys (
    id SERIAL PRIMARY KEY,
    survey_date DATE NOT NULL,
    establishment_name VARCHAR(255) NOT NULL,
    ae_type VARCHAR(100),
    num_rooms INTEGER,
    city VARCHAR(100),
    province VARCHAR(100),
    enumerator VARCHAR(255),
    checkin_date DATE,
    checkout_date DATE,
    purpose VARCHAR(255),
    source VARCHAR(255),
    room_nights INTEGER,
    transport VARCHAR(255),
    nationality_data JSONB,
    owner VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Regional Distribution Table
CREATE TABLE regional_distribution (
    id SERIAL PRIMARY KEY,
    origin VARCHAR(255) NOT NULL,
    count INTEGER NOT NULL,
    is_manual BOOLEAN DEFAULT false,
    owner VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feedback Table
CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    from_name VARCHAR(255),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_regional_origin ON regional_distribution(origin);
CREATE INDEX idx_notifications_username ON notifications(username);
CREATE INDEX idx_attraction_date ON attraction_surveys(survey_date);
CREATE INDEX idx_accommodation_date ON accommodation_surveys(survey_date);
