#!/bin/bash

# Quick deployment script for SynProd
# This script provides a fast deployment option for development and testing

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

echo -e "${GREEN}⚡ SynProd Quick Deployment${NC}"
echo -e "${BLUE}===========================${NC}"

# Function to check if environment file exists
check_environment() {
    if [ ! -f "$ENV_FILE" ]; then
        echo -e "${RED}❌ Environment file $ENV_FILE not found${NC}"
        echo -e "${YELLOW}💡 Please copy deployment/env.production.template to $ENV_FILE and configure it${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Environment file found${NC}"
}

# Function to check if builds exist
check_builds() {
    echo -e "${YELLOW}🔍 Checking if builds exist...${NC}"
    
    # Check frontend build
    if [ ! -d "nginx/html" ] || [ -z "$(ls -A nginx/html)" ]; then
        echo -e "${YELLOW}⚠️  Frontend build not found. Building frontend...${NC}"
        ./scripts/build-frontend.sh
    else
        echo -e "${GREEN}✅ Frontend build found${NC}"
    fi
    
    # Check if Docker images exist
    if ! docker images | grep -q "synprod-backend"; then
        echo -e "${YELLOW}⚠️  Backend Docker image not found. Building backend...${NC}"
        ./scripts/build-backend.sh
    else
        echo -e "${GREEN}✅ Backend Docker image found${NC}"
    fi
    
    if ! docker images | grep -q "synprod-nginx"; then
        echo -e "${YELLOW}⚠️  Nginx Docker image not found. Building nginx...${NC}"
        docker build -t synprod-nginx:latest ./nginx
    else
        echo -e "${GREEN}✅ Nginx Docker image found${NC}"
    fi
}

# Function to stop existing services
stop_services() {
    echo -e "${YELLOW}🛑 Stopping existing services...${NC}"
    
    if docker-compose -f "$COMPOSE_FILE" ps -q | grep -q .; then
        docker-compose -f "$COMPOSE_FILE" down
        echo -e "${GREEN}✅ Services stopped${NC}"
    else
        echo -e "${YELLOW}ℹ️  No running services found${NC}"
    fi
}

# Function to start services
start_services() {
    echo -e "${YELLOW}🚀 Starting services...${NC}"
    
    # Load environment variables
    set -a
    source "$ENV_FILE"
    set +a
    
    # Start services
    docker-compose -f "$COMPOSE_FILE" up -d
    
    echo -e "${GREEN}✅ Services started${NC}"
}

# Function to wait for services
wait_for_services() {
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
    
    echo -e "${GREEN}✅ Services are ready${NC}"
}

# Function to show status
show_status() {
    echo -e "${GREEN}🎉 Quick deployment completed!${NC}"
    echo -e "${BLUE}===========================${NC}"
    
    echo -e "${YELLOW}📊 Service Status:${NC}"
    docker-compose -f "$COMPOSE_FILE" ps
    
    echo -e "${YELLOW}🌐 Application URLs:${NC}"
    echo -e "  Frontend: http://localhost"
    echo -e "  Backend API: http://localhost:8080/api"
    echo -e "  Health Check: http://localhost/health"
    
    echo -e "${YELLOW}📋 Quick Commands:${NC}"
    echo -e "  View logs: docker-compose -f $COMPOSE_FILE logs -f"
    echo -e "  Stop: docker-compose -f $COMPOSE_FILE down"
    echo -e "  Restart: docker-compose -f $COMPOSE_FILE restart"
}

# Main function
main() {
    check_environment
    check_builds
    stop_services
    start_services
    wait_for_services
    show_status
}

# Run main function
main "$@"
