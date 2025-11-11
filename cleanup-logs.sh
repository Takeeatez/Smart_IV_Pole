#!/bin/bash

# Cleanup script for removing emoji logging and excessive console.log
# Run this before AWS deployment

echo "Starting cleanup process..."

# Backend: Remove emoji from System.out.println
find Smart_IV_Pole-be/src -name "*.java" -type f -exec sed -i '' 's/🔴 \[Scheduler\]/[Scheduler]/g' {} \;
find Smart_IV_Pole-be/src -name "*.java" -type f -exec sed -i '' 's/📊 \[Scheduler\]/[Scheduler]/g' {} \;
find Smart_IV_Pole-be/src -name "*.java" -type f -exec sed -i '' 's/📝 /[INFO] /g' {} \;

# Frontend: Remove excessive console.log with emojis (keep error logging)
# This is handled manually for safety to avoid breaking functional code

echo "✓ Emoji cleanup complete"
echo "⚠ Manual review recommended for:"
echo "  - frontend/src/stores/wardStore.ts (extensive logging)"
echo "  - frontend/src/services/api.ts (initialization logging)"
echo "  - frontend/src/App.tsx (initialization logging)"

echo ""
echo "Next steps:"
echo "1. Review and remove unnecessary console.log statements manually"
echo "2. Set up .env files with production credentials"
echo "3. Test application functionality"
echo "4. Commit changes to Git"
