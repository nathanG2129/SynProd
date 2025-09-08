#!/bin/bash

# Backend deployment script for SynProd
# This script builds the backend and creates the Docker image

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_DIR="backend"
IMAGE_NAME="synprod-backend"
IMAGE_TAG="latest"
FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}"

echo -e "${GREEN}🚀 SynProd Backend Deployment${NC}"
echo -e "${BLUE}===========================${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    exit 1
fi

# Check Java
if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Java is not installed. Please install Java 21 and try again.${NC}"
    exit 1
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker and try again.${NC}"
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Clean previous backend build
if [ -d "$BACKEND_DIR/build" ]; then
    rm -rf "$BACKEND_DIR/build"
    echo -e "${GREEN}✅ Cleaned previous backend build${NC}"
fi

# Navigate to backend directory
cd "$BACKEND_DIR"

# Make gradlew executable
chmod +x gradlew

# Build backend
echo -e "${YELLOW}🔨 Building backend...${NC}"
echo -e "${YELLOW}  🔨 Running Gradle build...${NC}"
./gradlew build -x test --no-daemon

# Check if build was successful
if [ ! -f "build/libs"/*.jar ]; then
    echo -e "${RED}❌ Backend build failed! JAR file not found.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend build completed${NC}"

# Return to root directory
cd ..

# Build Docker image
echo -e "${YELLOW}🐳 Building Docker image...${NC}"
echo -e "${YELLOW}  🔨 Building backend Docker image...${NC}"
docker build -t "$FULL_IMAGE_NAME" ./backend

# Check if Docker build was successful
if ! docker images "$FULL_IMAGE_NAME" >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker image build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker image built successfully!${NC}"

# Show image information
echo -e "${YELLOW}📊 Docker Image Information:${NC}"
docker images "$FULL_IMAGE_NAME" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

echo -e "${GREEN}🎉 Backend deployment completed successfully!${NC}"
echo -e "${YELLOW}💡 Next step: Run ./scripts/start-containers.sh to start the services${NC}"
