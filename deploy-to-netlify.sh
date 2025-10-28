#!/bin/bash

# Netlify Deployment Script for Linux/Mac/Git Bash
# This script automates the deployment process to Netlify

echo "========================================"
echo "  Netlify Deployment Script"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if Netlify CLI is installed
echo -e "${YELLOW}Checking Netlify CLI installation...${NC}"
if command -v netlify &> /dev/null; then
    NETLIFY_VERSION=$(netlify --version)
    echo -e "${GREEN}✓ Netlify CLI is installed: $NETLIFY_VERSION${NC}"
else
    echo -e "${RED}✗ Netlify CLI is not installed${NC}"
    echo -e "${YELLOW}Installing Netlify CLI globally...${NC}"
    npm install -g netlify-cli
    echo -e "${GREEN}✓ Netlify CLI installed successfully${NC}"
fi

echo ""

# Check if user is logged in
echo -e "${YELLOW}Checking Netlify login status...${NC}"
if netlify status 2>&1 | grep -q "Not logged in"; then
    echo -e "${RED}✗ Not logged in to Netlify${NC}"
    echo -e "${YELLOW}Opening browser for authentication...${NC}"
    netlify login
    echo -e "${GREEN}✓ Login successful${NC}"
else
    echo -e "${GREEN}✓ Already logged in to Netlify${NC}"
fi

echo ""

# Check if site is linked
echo -e "${YELLOW}Checking if site is linked...${NC}"
if [ -f ".netlify/state.json" ]; then
    echo -e "${GREEN}✓ Site is already linked${NC}"
else
    echo -e "${RED}✗ Site is not linked${NC}"
    echo -e "${YELLOW}Initializing new Netlify site...${NC}"
    netlify init
    echo -e "${GREEN}✓ Site initialized successfully${NC}"
fi

echo ""

# Set environment variables
echo -e "${YELLOW}Setting environment variables...${NC}"
echo -e "${CYAN}Note: You may need to set these manually in Netlify Dashboard if this fails${NC}"

declare -A ENV_VARS=(
    ["VITE_APP_ENV"]="production"
    ["VITE_SUPABASE_URL"]="https://gtnpmxlnzpfqbhfzuitj.supabase.co"
    ["VITE_SUPABASE_ANON_KEY"]="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bnBteGxuenBmcWJoZnp1aXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MjExNTQsImV4cCI6MjA3MzM5NzE1NH0.cREEJprRj9dnCk5zc9vqsyiSAdFt3ih7aTUUnpkNjB8"
    ["VITE_DIRECT_LOGIN_ENABLED"]="false"
    ["NODE_VERSION"]="18"
)

for key in "${!ENV_VARS[@]}"; do
    if netlify env:set "$key" "${ENV_VARS[$key]}" --silent 2>/dev/null; then
        echo -e "  ${GREEN}✓ Set $key${NC}"
    else
        echo -e "  ${YELLOW}⚠ Could not set $key (may need manual configuration)${NC}"
    fi
done

echo ""

# Build the project
echo -e "${YELLOW}Building the project...${NC}"
if npm run build; then
    echo -e "${GREEN}✓ Build completed successfully${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    echo -e "${RED}Please fix build errors and try again${NC}"
    exit 1
fi

echo ""

# Deploy to Netlify
echo -e "${YELLOW}Deploying to Netlify...${NC}"
echo -e "${CYAN}This may take a few minutes...${NC}"
if netlify deploy --prod; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  ✓ Deployment Successful!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${GREEN}Your site is now live!${NC}"
    echo -e "${CYAN}Check the URL above to visit your deployed site.${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Visit your site and verify it works correctly"
    echo "2. Configure a custom domain (optional)"
    echo "3. Set up a database for full functionality (optional)"
    echo ""
else
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}  ✗ Deployment Failed${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    echo -e "${RED}Please check the error messages above.${NC}"
    echo -e "${YELLOW}You can also try deploying manually:${NC}"
    echo -e "${CYAN}  netlify deploy --prod${NC}"
    echo ""
    exit 1
fi

