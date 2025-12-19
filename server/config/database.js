const { Pool } = require('pg');
require('dotenv').config();

// Use DATABASE_URL if available (Railway/production), otherwise use individual vars (local dev)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || undefined,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    // Fallback to individual vars if DATABASE_URL not set (for local development)
    user: !process.env.DATABASE_URL ? (process.env.DB_USER || 'postgres') : undefined,
    host: !process.env.DATABASE_URL ? (process.env.DB_HOST || 'localhost') : undefined,
    database: !process.env.DATABASE_URL ? (process.env.DB_NAME || 'turista_db') : undefined,
    password: !process.env.DATABASE_URL ? (process.env.DB_PASSWORD || 'your_password') : undefined,
    port: !process.env.DATABASE_URL ? (process.env.DB_PORT || 5432) : undefined,
});

module.exports = pool;