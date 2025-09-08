#!/bin/bash

# Comprehensive build script for SynProd
# This script builds both frontend and backend for production deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_DIR="frontend"
BACKEND_DIR="backend"
BUILD_DIR="dist"
NGINX_HTML_DIR="nginx/html"

echo -e "${GREEN}🚀 SynProd Complete Build Process${NC}"
echo -e "${BLUE}=================================${NC}"

# Function to check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"
    
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
    
    # Check Java (for backend build)
    if ! command -v java &> /dev/null; then
        echo -e "${RED}❌ Java is not installed. Please install Java 21 and try again.${NC}"
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed. Please install Docker and try again.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All prerequisites are met${NC}"
}

# Function to clean previous builds
clean_builds() {
    echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
    
    # Clean frontend build
    if [ -d "$BUILD_DIR/frontend" ]; then
        rm -rf "$BUILD_DIR/frontend"
        echo -e "${YELLOW}  ✓ Cleaned frontend build directory${NC}"
    fi
    
    # Clean nginx html directory
    if [ -d "$NGINX_HTML_DIR" ]; then
        rm -rf "$NGINX_HTML_DIR"/*
        echo -e "${YELLOW}  ✓ Cleaned nginx html directory${NC}"
    fi
    
    # Clean backend build
    if [ -d "$BACKEND_DIR/build" ]; then
        rm -rf "$BACKEND_DIR/build"
        echo -e "${YELLOW}  ✓ Cleaned backend build directory${NC}"
    fi
    
    echo -e "${GREEN}✅ Build cleanup completed${NC}"
}

# Function to install dependencies
install_dependencies() {
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    
    # Install frontend dependencies
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}  📦 Installing npm dependencies...${NC}"
        npm install
    else
        echo -e "${YELLOW}  ✓ Dependencies already installed${NC}"
    fi
    
    echo -e "${GREEN}✅ Dependencies installation completed${NC}"
}

# Function to build frontend
build_frontend() {
    echo -e "${YELLOW}🔨 Building frontend...${NC}"
    
    # Build frontend
    echo -e "${YELLOW}  🔨 Running nx build frontend...${NC}"
    npx nx build frontend
    
    # Check if build was successful
    if [ ! -d "$BUILD_DIR/frontend" ]; then
        echo -e "${RED}❌ Frontend build failed! Build directory not found.${NC}"
        exit 1
    fi
    
    # Create nginx html directory
    mkdir -p "$NGINX_HTML_DIR"
    
    # Copy built files to nginx directory
    echo -e "${YELLOW}  📋 Copying frontend files to nginx directory...${NC}"
    cp -r "$BUILD_DIR/frontend"/* "$NGINX_HTML_DIR/"
    
    echo -e "${GREEN}✅ Frontend build completed${NC}"
}

# Function to build backend
build_backend() {
    echo -e "${YELLOW}🔨 Building backend...${NC}"
    
    # Navigate to backend directory
    cd "$BACKEND_DIR"
    
    # Make gradlew executable
    chmod +x gradlew
    
    # Build backend
    echo -e "${YELLOW}  🔨 Running Gradle build...${NC}"
    ./gradlew build -x test --no-daemon
    
    # Check if build was successful
    if [ ! -f "build/libs"/*.jar ]; then
        echo -e "${RED}❌ Backend build failed! JAR file not found.${NC}"
        exit 1
    fi
    
    # Return to root directory
    cd ..
    
    echo -e "${GREEN}✅ Backend build completed${NC}"
}

# Function to build Docker images
build_docker_images() {
    echo -e "${YELLOW}🐳 Building Docker images...${NC}"
    
    # Build backend Docker image
    echo -e "${YELLOW}  🔨 Building backend Docker image...${NC}"
    docker build -t synprod-backend:latest ./backend
    
    # Build nginx Docker image
    echo -e "${YELLOW}  🔨 Building nginx Docker image...${NC}"
    docker build -t synprod-nginx:latest ./nginx
    
    echo -e "${GREEN}✅ Docker images built successfully${NC}"
}

# Function to show build summary
show_build_summary() {
    echo -e "${GREEN}🎉 Build process completed successfully!${NC}"
    echo -e "${BLUE}=================================${NC}"
    
    # Show frontend build size
    if [ -d "$BUILD_DIR/frontend" ]; then
        echo -e "${YELLOW}📊 Frontend build size:${NC}"
        du -sh "$BUILD_DIR/frontend"
    fi
    
    # Show backend build size
    if [ -d "$BACKEND_DIR/build" ]; then
        echo -e "${YELLOW}📊 Backend build size:${NC}"
        du -sh "$BACKEND_DIR/build"
    fi
    
    # Show Docker images
    echo -e "${YELLOW}🐳 Docker images:${NC}"
    docker images | grep synprod || echo "No SynProd images found"
    
    echo -e "${YELLOW}📋 Next steps:${NC}"
    echo -e "  1. Configure environment variables in .env.production"
    echo -e "  2. Run deployment script: ./scripts/deploy-production.sh"
    echo -e "  3. Or start services: docker-compose -f docker-compose.prod.yml up -d"
}

# Main build process
main() {
    check_prerequisites
    clean_builds
    install_dependencies
    build_frontend
    build_backend
    build_docker_images
    show_build_summary
}

# Run main function
main "$@"
