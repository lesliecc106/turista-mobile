#!/bin/bash

# Create a temporary file
cp server/routes/analytics.js temp_analytics.js

# Use awk to remove the entire old dashboard/stats route block
awk '
/router\.get\(.*\/dashboard\/stats/ {
    in_block = 1
    brace_count = 0
    next
}
in_block {
    # Count braces
    for(i=1; i<=length($0); i++) {
        char = substr($0, i, 1)
        if(char == "{") brace_count++
        if(char == "}") brace_count--
    }
    # If we found the closing brace of the route
    if(brace_count < 0) {
        in_block = 0
        next
    }
    next
}
!in_block { print }
' temp_analytics.js > server/routes/analytics.js

rm temp_analytics.js

echo "✅ Old endpoint removed precisely"

