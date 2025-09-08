#!/bin/bash

# Production deployment script for SynProd
# This script builds and deploys the complete application stack

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
BACKUP_DIR="backups"
LOG_DIR="logs"
DATA_DIR="data"

echo -e "${GREEN}🚀 SynProd Production Deployment${NC}"
echo -e "${BLUE}================================${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"
    
    # Check Docker
    if ! command_exists docker; then
        echo -e "${RED}❌ Docker is not installed. Please install Docker and try again.${NC}"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose and try again.${NC}"
        exit 1
    fi
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
        exit 1
    fi
    
    # Check Node.js for frontend build
    if ! command_exists node; then
        echo -e "${RED}❌ Node.js is not installed. Please install Node.js and try again.${NC}"
        exit 1
    fi
    
    # Check npm
    if ! command_exists npm; then
        echo -e "${RED}❌ npm is not installed. Please install npm and try again.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All prerequisites are met${NC}"
}

# Function to check environment file
check_environment() {
    echo -e "${YELLOW}🔧 Checking environment configuration...${NC}"
    
    if [ ! -f "$ENV_FILE" ]; then
        echo -e "${RED}❌ Environment file $ENV_FILE not found${NC}"
        echo -e "${YELLOW}💡 Please copy deployment/env.production.template to $ENV_FILE and configure it${NC}"
        exit 1
    fi
    
    # Load environment variables
    set -a
    source "$ENV_FILE"
    set +a
    
    # Check required variables
    required_vars=("POSTGRES_PASSWORD" "JWT_SECRET" "APP_ADMIN_PASSWORD" "APP_MANAGER_PASSWORD")
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            echo -e "${RED}❌ Required environment variable $var is not set${NC}"
            exit 1
        fi
    done
    
    echo -e "${GREEN}✅ Environment configuration is valid${NC}"
}

# Function to create necessary directories
create_directories() {
    echo -e "${YELLOW}📁 Creating necessary directories...${NC}"
    
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$LOG_DIR/backend"
    mkdir -p "$LOG_DIR/nginx"
    mkdir -p "$DATA_DIR/postgres"
    mkdir -p "nginx/html"
    
    echo -e "${GREEN}✅ Directories created${NC}"
}

# Function to build frontend
build_frontend() {
    echo -e "${YELLOW}🔨 Building frontend...${NC}"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing dependencies...${NC}"
        npm install
    fi
    
    # Build frontend
    npx nx build frontend
    
    # Copy to nginx directory
    echo -e "${YELLOW}📋 Copying frontend files to nginx directory...${NC}"
    cp -r dist/frontend/* nginx/html/
    
    echo -e "${GREEN}✅ Frontend built and prepared${NC}"
}

# Function to build Docker images
build_images() {
    echo -e "${YELLOW}🐳 Building Docker images...${NC}"
    
    # Build backend image
    echo -e "${YELLOW}🔨 Building backend image...${NC}"
    docker build -t synprod-backend:latest ./backend
    
    # Build nginx image
    echo -e "${YELLOW}🔨 Building nginx image...${NC}"
    docker build -t synprod-nginx:latest ./nginx
    
    echo -e "${GREEN}✅ Docker images built${NC}"
}

# Function to stop existing services
stop_services() {
    echo -e "${YELLOW}🛑 Stopping existing services...${NC}"
    
    if docker-compose -f "$COMPOSE_FILE" ps -q | grep -q .; then
        docker-compose -f "$COMPOSE_FILE" down
    fi
    
    echo -e "${GREEN}✅ Services stopped${NC}"
}

# Function to start services
start_services() {
    echo -e "${YELLOW}🚀 Starting services...${NC}"
    
    # Start services
    docker-compose -f "$COMPOSE_FILE" up -d
    
    echo -e "${GREEN}✅ Services started${NC}"
}

# Function to wait for services to be healthy
wait_for_services() {
    echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
    
    # Wait for postgres
    echo -e "${YELLOW}📊 Waiting for PostgreSQL...${NC}"
    timeout 60 bash -c 'until docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U synprod; do sleep 2; done'
    
    # Wait for backend
    echo -e "${YELLOW}📊 Waiting for Backend...${NC}"
    timeout 120 bash -c 'until curl -f http://localhost:8080/api/health >/dev/null 2>&1; do sleep 5; done'
    
    # Wait for nginx
    echo -e "${YELLOW}📊 Waiting for Nginx...${NC}"
    timeout 60 bash -c 'until curl -f http://localhost/health >/dev/null 2>&1; do sleep 2; done'
    
    echo -e "${GREEN}✅ All services are healthy${NC}"
}

# Function to show deployment status
show_status() {
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${BLUE}================================${NC}"
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
    echo -e "  Backup database: docker-compose -f $COMPOSE_FILE exec backup /backup.sh"
}

# Main deployment process
main() {
    check_prerequisites
    check_environment
    create_directories
    build_frontend
    build_images
    stop_services
    start_services
    wait_for_services
    show_status
}

# Run main function
main "$@"
