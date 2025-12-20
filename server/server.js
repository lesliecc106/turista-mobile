const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'turista-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/migrate', require('./routes/migrate'));
app.use('/api/fix-schema', require('./routes/fix-schema'));
app.use('/api/restore', require('./routes/restore-admins'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/schema', require('./routes/update-schema'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});
