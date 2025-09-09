#!/bin/bash

# Frontend deployment script for SynProd
# This script orchestrates the complete frontend deployment process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 SynProd Frontend Deployment${NC}"
echo -e "${BLUE}=============================${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Starting complete frontend deployment...${NC}"
echo

# Step 1: Build the frontend
echo -e "${YELLOW}🔨 Step 1: Building frontend...${NC}"
./scripts/build-frontend.sh
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend build failed!${NC}"
    exit 1
fi

echo
echo -e "${GREEN}✅ Frontend build completed successfully!${NC}"
echo

# Step 2: Copy files to nginx
echo -e "${YELLOW}📋 Step 2: Copying files to nginx...${NC}"
./scripts/copy-frontend.sh
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend copy failed!${NC}"
    exit 1
fi

echo
echo -e "${GREEN}🎉 Frontend deployment completed successfully!${NC}"
echo -e "${YELLOW}💡 Next step: Run ./scripts/deploy-backend.sh to build the backend${NC}"
