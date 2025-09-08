#!/bin/bash

# Build script for SynProd backend Docker image
# This script builds the Spring Boot application Docker image for production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="synprod-backend"
IMAGE_TAG="latest"
FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}"

echo -e "${GREEN}🚀 Building SynProd Backend Docker Image${NC}"
echo -e "${YELLOW}Image: ${FULL_IMAGE_NAME}${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Navigate to backend directory
cd "$(dirname "$0")/../backend"

# Build the Docker image
echo -e "${YELLOW}📦 Building Docker image...${NC}"
docker build -t "${FULL_IMAGE_NAME}" .

# Check if build was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker image built successfully!${NC}"
    echo -e "${YELLOW}Image: ${FULL_IMAGE_NAME}${NC}"
    
    # Show image size
    echo -e "${YELLOW}📊 Image size:${NC}"
    docker images "${FULL_IMAGE_NAME}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
    
    # Show image layers
    echo -e "${YELLOW}🔍 Image layers:${NC}"
    docker history "${FULL_IMAGE_NAME}" --format "table {{.CreatedBy}}\t{{.Size}}"
    
else
    echo -e "${RED}❌ Docker build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Backend Docker image build completed successfully!${NC}"
