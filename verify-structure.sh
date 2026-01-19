#!/bin/bash
# Project Organization Verification Script
# Run this to verify the project structure is correct

echo "🔍 Beauty Salon Project Structure Verification"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check backend files
echo "📁 Checking Backend Directory..."
BACKEND_FILES=(
  "backend/index.js"
  "backend/package.json"
  "backend/.env.example"
  "backend/.replit"
  "backend/.gitignore"
  "backend/README.md"
)

backend_ok=true
for file in "${BACKEND_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file"
  else
    echo -e "${RED}✗${NC} $file (MISSING)"
    backend_ok=false
  fi
done

echo ""
echo "📁 Checking Frontend Directory..."
FRONTEND_FILES=(
  "frontend/package.json"
  "frontend/.env.example"
  "frontend/.gitignore"
  "frontend/README.md"
  "frontend/index.html"
  "frontend/vite.config.js"
  "frontend/eslint.config.js"
  "frontend/src"
  "frontend/public"
)

frontend_ok=true
for file in "${FRONTEND_FILES[@]}"; do
  if [ -e "$file" ]; then
    echo -e "${GREEN}✓${NC} $file"
  else
    echo -e "${RED}✗${NC} $file (MISSING)"
    frontend_ok=false
  fi
done

echo ""
echo "📁 Checking Root Documentation..."
ROOT_DOCS=(
  "README.md"
  "ORGANIZATION-GUIDE.md"
)

docs_ok=true
for file in "${ROOT_DOCS[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file"
  else
    echo -e "${RED}✗${NC} $file (MISSING)"
    docs_ok=false
  fi
done

echo ""
echo "📊 Directory Sizes:"
echo "Backend: $(du -sh backend/ 2>/dev/null | cut -f1)"
echo "Frontend: $(du -sh frontend/ 2>/dev/null | cut -f1)"

echo ""
echo "=============================================="
if [ "$backend_ok" = true ] && [ "$frontend_ok" = true ] && [ "$docs_ok" = true ]; then
  echo -e "${GREEN}✅ All files verified successfully!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Review backend/README.md for Replit deployment"
  echo "2. Review frontend/README.md for Vercel deployment"
  echo "3. Create new GitHub repos when ready"
  exit 0
else
  echo -e "${RED}❌ Some files are missing. Please check above.${NC}"
  exit 1
fi
