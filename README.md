# TURIS-TA Mobile App

Modern mobile-first tourism management system for Iriga City Tourism Office with PostgreSQL backend.

## 🚀 Quick Start Guide

### Prerequisites
- ✅ Node.js v18+ installed
- ✅ PostgreSQL 16+ (x64) installed  
- ✅ Visual Studio Code
- ✅ Your PostgreSQL password: **081008** (already configured in .env)

### Installation Steps

#### 1. Extract & Open in VS Code
```bash
# Extract the ZIP file
# Open the turista-mobile folder in Visual Studio Code
```

#### 2. Install Dependencies
Open Terminal in VS Code (Ctrl + `) and run:
```bash
npm install
```

Wait for all packages to install (~2-3 minutes).

#### 3. Setup PostgreSQL Database

**Option A: Using pgAdmin** (Recommended)
1. Open pgAdmin 4
2. Connect to PostgreSQL (password: 081008)
3. Right-click "Databases" → "Create" → "Database"
4. Name: `turista_db`
5. Click "Save"

**Option B: Using SQL Shell (psql)**
```bash
# Open SQL Shell (psql) from Start Menu
# Press Enter 4 times
# Enter password: 081008
# Then run:
CREATE DATABASE turista_db;
```

#### 4. Initialize Database Tables

In pgAdmin:
1. Right-click `turista_db` database
2. Select "Query Tool"
3. Open and run the `database.sql` file

OR via command line:
```bash
psql -U postgres -d turista_db -f database.sql
```

Enter password when prompted: `081008`

#### 5. Start the Server
Back in VS Code terminal:
```bash
npm start
```

You should see:
```
🚀 TURIS-TA Mobile Server running on http://localhost:3000
✅ Connected to PostgreSQL database
```

#### 6. Open in Browser
Go to: **http://localhost:3000**

#### 7. Login with Admin Account
Use any of these THREE admin accounts:
- Username: `admin01` | Password: `AdminPass01`
- Username: `admin02` | Password: `AdminPass02`
- Username: `admin03` | Password: `AdminPass03`

## ✨ Features

### For All Users
- 📱 Modern mobile-first responsive UI
- 📝 Submit attraction surveys
- 🏨 Submit accommodation surveys
- 📊 View submission history
- 💬 Send feedback
- 🌙 Dark mode support

### For Admins (admin01, admin02, admin03)
- 📊 Analytics dashboard with charts
- 🌍 Regional distribution management
- 📈 Generate reports & export data (Excel)
- 👥 User approval workflow
- 📋 View all submissions
- 🔔 Notifications system
- 👤 User management

## 🐛 Troubleshooting

### "Database connection failed"
- ✅ Check PostgreSQL is running (Services → postgresql)
- ✅ Verify password in `.env` is correct (081008)
- ✅ Ensure database `turista_db` exists
- ✅ Check port 5432 is available

### "Port 3000 already in use"
Change port in `.env`:
```env
PORT=3001
```
Then restart server and access at: http://localhost:3001

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Cannot login with admin accounts
Make sure you ran the `database.sql` script to create admin accounts.

## 📱 Mobile Features

- Bottom navigation for easy thumb access
- Swipe gestures support
- Touch-optimized buttons (44px+)
- Card-based layouts
- Smooth animations
- Pull-to-refresh
- Responsive breakpoints

## 🎨 UI/UX
- Modern gradient design
- Dark mode support
- Toast notifications
- Modal dialogs
- Loading states
- Chart visualizations (Chart.js)
- Excel export (SheetJS)

## 📊 Tech Stack

- **Backend**: Node.js + Express
- **Database**: PostgreSQL 16
- **Frontend**: Vanilla JavaScript + Modern CSS
- **Charts**: Chart.js 4.4.1
- **Export**: SheetJS (XLSX)
- **Icons**: Font Awesome 6.5.1

## 🔒 Security Notes

The admin passwords are currently stored as plain text for DEMO purposes only.

**For PRODUCTION, hash passwords:**
```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YourNewPassword', 10, (err, hash) => console.log(hash));"
```

Then update database:
```sql
UPDATE users SET password = '$2b$10$hashedPasswordHere' WHERE username = 'admin01';
```

## 📞 Support

For technical support:
- Email: admin@iriga.gov.ph
- Office: Iriga City Tourism Office
- Phone: (Contact tourism office)

## 📜 License

© 2024 Iriga City Tourism Office. All rights reserved.

---

**Version:** 2.0.0 (Mobile Edition)  
**Last Updated:** December 2024  
**Platform:** Node.js + PostgreSQL + Modern Web
