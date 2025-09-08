#!/bin/bash

# Build script for SynProd frontend
# This script builds the React frontend and prepares it for nginx serving

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_DIR="frontend"
BUILD_DIR="dist/frontend"
NGINX_DIR="nginx/html"

echo -e "${GREEN}🚀 Building SynProd Frontend${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js and try again.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm and try again.${NC}"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Build the frontend
echo -e "${YELLOW}🔨 Building frontend...${NC}"
npx nx build frontend

# Check if build was successful
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ Frontend build failed! Build directory not found.${NC}"
    exit 1
fi

# Create nginx html directory
echo -e "${YELLOW}📁 Preparing nginx directory...${NC}"
mkdir -p "$NGINX_DIR"

# Copy built files to nginx directory
echo -e "${YELLOW}📋 Copying files to nginx directory...${NC}"
cp -r "$BUILD_DIR"/* "$NGINX_DIR/"

# Show build results
echo -e "${GREEN}✅ Frontend build completed successfully!${NC}"
echo -e "${YELLOW}📊 Build directory: $BUILD_DIR${NC}"
echo -e "${YELLOW}📊 Nginx directory: $NGINX_DIR${NC}"

# Show file sizes
echo -e "${YELLOW}📈 Build size:${NC}"
du -sh "$BUILD_DIR"

# List main files
echo -e "${YELLOW}📄 Main files:${NC}"
ls -la "$BUILD_DIR" | head -10

echo -e "${GREEN}🎉 Frontend build process completed successfully!${NC}"
echo -e "${YELLOW}💡 The frontend is now ready to be served by nginx${NC}"
