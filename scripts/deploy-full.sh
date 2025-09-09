#!/bin/bash

# Complete deployment script for SynProd (Linux/Mac)
# This script builds frontend, backend, and starts production containers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 SynProd Complete Deployment${NC}"
echo -e "${BLUE}=============================${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Starting complete SynProd deployment...${NC}"
echo

# Step 1: Build Frontend
echo -e "${YELLOW}🔨 Step 1: Building Frontend...${NC}"
./scripts/build-frontend.sh
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend build failed!${NC}"
    exit 1
fi

echo
echo -e "${GREEN}✅ Frontend build completed successfully!${NC}"
echo

# Step 2: Copy Frontend to Nginx
echo -e "${YELLOW}📋 Step 2: Copying Frontend to Nginx...${NC}"
./scripts/copy-frontend.sh
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend copy failed!${NC}"
    exit 1
fi

echo
echo -e "${GREEN}✅ Frontend deployment completed successfully!${NC}"
echo

# Step 3: Build Backend
echo -e "${YELLOW}🔨 Step 3: Building Backend...${NC}"
./scripts/deploy-backend.sh
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backend build failed!${NC}"
    exit 1
fi

echo
echo -e "${GREEN}✅ Backend build completed successfully!${NC}"
echo

# Step 4: Start Production Containers
echo -e "${YELLOW}🐳 Step 4: Starting Production Containers...${NC}"
./scripts/start-containers.sh
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Container startup failed!${NC}"
    exit 1
fi

echo
echo -e "${GREEN}🎉 Complete SynProd deployment successful!${NC}"
echo
echo -e "${YELLOW}📊 Deployment Summary:${NC}"
echo -e "   ${GREEN}✅${NC} Frontend built and deployed to nginx"
echo -e "   ${GREEN}✅${NC} Backend built and ready"
echo -e "   ${GREEN}✅${NC} Production containers started"
echo
echo -e "${YELLOW}🌐 Your application should now be available at:${NC}"
echo -e "   ${BLUE}http://localhost${NC} (via nginx)"
echo -e "   ${BLUE}http://localhost:8080${NC} (direct backend access)"
echo
echo -e "${YELLOW}💡 To view logs:${NC} docker-compose -f docker-compose.prod.yml logs -f"
echo -e "${YELLOW}💡 To stop:${NC} docker-compose -f docker-compose.prod.yml down"
