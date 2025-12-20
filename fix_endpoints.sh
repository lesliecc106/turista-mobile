#!/bin/bash

# Find the line number where old dashboard/stats starts
START_LINE=$(grep -n "router.get('/dashboard/stats'" server/routes/analytics.js | cut -d: -f1)

if [ ! -z "$START_LINE" ]; then
    echo "Found old endpoint at line $START_LINE"
    
    # Find the closing brace of this route (next occurrence after a reasonable gap)
    # We'll remove from START_LINE to approximately 65 lines later (covers the whole route)
    END_LINE=$((START_LINE + 65))
    
    echo "Removing lines $START_LINE to $END_LINE..."
    
    # Use sed to delete the range
    sed -i "${START_LINE},${END_LINE}d" server/routes/analytics.js
    
    echo "‚úÖ Old endpoint removed"
else
    echo "‚ö†Ô∏è  Old endpoint not found (maybe already removed)"
fi

# Verify what we have now
echo ""
echo "Ì≥ä Current dashboard endpoints:"
grep -n "dashboard" server/routes/analytics.js

