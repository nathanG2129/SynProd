#!/bin/bash

# Container startup script for SynProd
# This script starts the Docker containers for backend and nginx

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"

echo -e "${GREEN}🚀 SynProd Container Startup${NC}"
echo -e "${BLUE}===========================${NC}"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Environment file $ENV_FILE not found${NC}"
    echo -e "${YELLOW}💡 Please copy deployment/env.production.template to $ENV_FILE and configure it${NC}"
    exit 1
fi

# Check if Docker images exist
if ! docker images | grep -q "synprod-backend"; then
    echo -e "${RED}❌ Backend Docker image not found${NC}"
    echo -e "${YELLOW}💡 Please run ./scripts/deploy-backend.sh first${NC}"
    exit 1
fi

# Check if nginx html directory exists and has content
if [ ! -d "nginx/html" ] || [ -z "$(ls -A nginx/html)" ]; then
    echo -e "${RED}❌ Nginx html directory not found or empty${NC}"
    echo -e "${YELLOW}💡 Please run ./scripts/deploy-frontend.sh first${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Build nginx image if it doesn't exist
if ! docker images | grep -q "synprod-nginx"; then
    echo -e "${YELLOW}🔨 Building nginx Docker image...${NC}"
    docker build -t synprod-nginx:latest ./nginx
    echo -e "${GREEN}✅ Nginx Docker image built${NC}"
else
    echo -e "${GREEN}✅ Nginx Docker image found${NC}"
fi

# Stop existing services if running
echo -e "${YELLOW}🛑 Stopping existing services...${NC}"
if docker-compose -f "$COMPOSE_FILE" ps -q | grep -q .; then
    docker-compose -f "$COMPOSE_FILE" down
    echo -e "${GREEN}✅ Services stopped${NC}"
else
    echo -e "${YELLOW}ℹ️  No running services found${NC}"
fi

# Start services
echo -e "${YELLOW}🚀 Starting services...${NC}"
docker-compose -f "$COMPOSE_FILE" up -d

echo -e "${GREEN}✅ Services started${NC}"

# Wait a moment for initial startup
echo -e "${YELLOW}⏳ Waiting for initial startup...${NC}"
sleep 10

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"

# Wait for postgres
echo -e "${YELLOW}📊 Waiting for PostgreSQL...${NC}"
timeout 30 bash -c 'until docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U synprod; do sleep 2; done' || true

# Wait for backend
echo -e "${YELLOW}📊 Waiting for Backend...${NC}"
timeout 60 bash -c 'until curl -f http://localhost:8080/api/health >/dev/null 2>&1; do sleep 5; done' || true

# Wait for nginx
echo -e "${YELLOW}📊 Waiting for Nginx...${NC}"
timeout 30 bash -c 'until curl -f http://localhost/health >/dev/null 2>&1; do sleep 2; done' || true

echo -e "${GREEN}✅ All services are ready${NC}"

# Show status
echo -e "${GREEN}🎉 SynProd is now running!${NC}"
echo -e "${BLUE}========================${NC}"

echo -e "${YELLOW}📊 Service Status:${NC}"
docker-compose -f "$COMPOSE_FILE" ps

echo -e "${YELLOW}🌐 Application URLs:${NC}"
echo -e "  Frontend: http://localhost"
echo -e "  Backend API: http://localhost:8080/api"
echo -e "  Health Check: http://localhost/health"

echo -e "${YELLOW}📋 Useful Commands:${NC}"
echo -e "  View logs: docker-compose -f $COMPOSE_FILE logs -f"
echo -e "  Stop services: docker-compose -f $COMPOSE_FILE down"
echo -e "  Restart services: docker-compose -f $COMPOSE_FILE restart"
