#!/bin/bash

# Frontend copy script for SynProd (Linux/Mac)
# This script copies the built frontend files to nginx directory

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

echo -e "${GREEN}📋 SynProd Frontend Copy${NC}"
echo -e "${BLUE}=======================${NC}"

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ Build directory not found: $BUILD_DIR${NC}"
    echo -e "${YELLOW}💡 Please run ./scripts/build-frontend.sh first${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build directory found: $BUILD_DIR${NC}"

# Clean nginx html directory
if [ -d "$NGINX_DIR" ]; then
    rm -rf "$NGINX_DIR"/*
    echo -e "${GREEN}✅ Cleaned nginx html directory${NC}"
fi

# Create nginx html directory if it doesn't exist
mkdir -p "$NGINX_DIR"

# Copy built files to nginx directory
echo -e "${YELLOW}📋 Copying frontend files to nginx directory...${NC}"
cp -r "$BUILD_DIR"/* "$NGINX_DIR/"

# Check if copy was successful
if [ ! -f "$NGINX_DIR/index.html" ]; then
    echo -e "${RED}❌ Copy failed! index.html not found in nginx directory.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend files copied successfully!${NC}"
echo -e "${YELLOW}📊 Build directory: $BUILD_DIR${NC}"
echo -e "${YELLOW}📊 Nginx directory: $NGINX_DIR${NC}"

# Show copied files
echo -e "${YELLOW}📈 Copied files:${NC}"
ls -la "$NGINX_DIR"

echo -e "${GREEN}🎉 Frontend is ready to be served by nginx${NC}"
echo -e "${YELLOW}💡 Next step: Restart nginx container or run ./scripts/deploy-backend.sh${NC}"
