#!/bin/bash

# Read the file and reorganize
{
    echo "const express = require('express');"
    echo "const router = express.Router();"
    echo "const pool = require('../db');"
    echo "const { requireAuth } = require('../middleware/auth');"
    echo ""
    
    # Skip the first few lines and the duplicate import at line 41
    sed '1,2d' server/routes/analytics.js | grep -v "const { requireAuth }"
} > server/routes/analytics_fixed.js

# Replace the file
mv server/routes/analytics_fixed.js server/routes/analytics.js

echo "✅ Import moved to top"
