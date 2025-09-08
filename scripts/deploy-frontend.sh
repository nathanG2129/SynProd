#!/bin/bash

# Frontend deployment script for SynProd
# This script builds the frontend and prepares it for nginx serving

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BUILD_DIR="dist/frontend"
NGINX_DIR="nginx/html"

echo -e "${GREEN}🚀 SynProd Frontend Deployment${NC}"
echo -e "${BLUE}=============================${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js and try again.${NC}"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Clean previous build
if [ -d "$BUILD_DIR" ]; then
    rm -rf "$BUILD_DIR"
    echo -e "${GREEN}✅ Cleaned previous frontend build${NC}"
fi

if [ -d "$NGINX_DIR" ]; then
    rm -rf "$NGINX_DIR"/*
    echo -e "${GREEN}✅ Cleaned nginx html directory${NC}"
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
mkdir -p "$NGINX_DIR"

# Copy built files to nginx directory
echo -e "${YELLOW}📋 Copying frontend files to nginx directory...${NC}"
cp -r "$BUILD_DIR"/* "$NGINX_DIR/"

# Show build results
echo -e "${GREEN}✅ Frontend deployment completed successfully!${NC}"
echo -e "${YELLOW}📊 Build directory: $BUILD_DIR${NC}"
echo -e "${YELLOW}📊 Nginx directory: $NGINX_DIR${NC}"

# Show file sizes
echo -e "${YELLOW}📈 Build size:${NC}"
du -sh "$BUILD_DIR"

echo -e "${GREEN}🎉 Frontend is ready to be served by nginx${NC}"
echo -e "${YELLOW}💡 Next step: Run ./scripts/deploy-backend.sh to build the backend${NC}"
