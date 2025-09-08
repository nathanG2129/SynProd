#!/bin/bash

# Maintenance script for SynProd
# This script provides common maintenance operations for the production deployment

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

# Function to show usage
show_usage() {
    echo -e "${GREEN}SynProd Maintenance Script${NC}"
    echo -e "${BLUE}=========================${NC}"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  status      - Show service status"
    echo "  logs        - Show service logs"
    echo "  restart     - Restart all services"
    echo "  stop        - Stop all services"
    echo "  start       - Start all services"
    echo "  backup      - Create database backup"
    echo "  restore     - Restore database from backup"
    echo "  update      - Update and restart services"
    echo "  clean       - Clean up unused Docker resources"
    echo "  health      - Check service health"
    echo "  shell       - Open shell in backend container"
    echo "  db-shell    - Open PostgreSQL shell"
    echo ""
}

# Function to show service status
show_status() {
    echo -e "${YELLOW}📊 Service Status${NC}"
    echo -e "${BLUE}================${NC}"
    docker-compose -f "$COMPOSE_FILE" ps
    echo ""
    
    echo -e "${YELLOW}🐳 Docker Images${NC}"
    echo -e "${BLUE}================${NC}"
    docker images | grep synprod || echo "No SynProd images found"
    echo ""
    
    echo -e "${YELLOW}💾 Disk Usage${NC}"
    echo -e "${BLUE}=============${NC}"
    docker system df
}

# Function to show logs
show_logs() {
    echo -e "${YELLOW}📋 Service Logs${NC}"
    echo -e "${BLUE}===============${NC}"
    echo "Press Ctrl+C to exit log viewing"
    echo ""
    docker-compose -f "$COMPOSE_FILE" logs -f
}

# Function to restart services
restart_services() {
    echo -e "${YELLOW}🔄 Restarting services...${NC}"
    docker-compose -f "$COMPOSE_FILE" restart
    echo -e "${GREEN}✅ Services restarted${NC}"
}

# Function to stop services
stop_services() {
    echo -e "${YELLOW}🛑 Stopping services...${NC}"
    docker-compose -f "$COMPOSE_FILE" down
    echo -e "${GREEN}✅ Services stopped${NC}"
}

# Function to start services
start_services() {
    echo -e "${YELLOW}🚀 Starting services...${NC}"
    
    # Load environment variables
    if [ -f "$ENV_FILE" ]; then
        set -a
        source "$ENV_FILE"
        set +a
    fi
    
    docker-compose -f "$COMPOSE_FILE" up -d
    echo -e "${GREEN}✅ Services started${NC}"
}

# Function to create backup
create_backup() {
    echo -e "${YELLOW}💾 Creating database backup...${NC}"
    
    # Create backup directory if it doesn't exist
    mkdir -p backups
    
    # Create backup
    BACKUP_FILE="backups/synprod_backup_$(date +%Y%m%d_%H%M%S).sql"
    docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U synprod synprod > "$BACKUP_FILE"
    
    # Compress backup
    gzip "$BACKUP_FILE"
    
    echo -e "${GREEN}✅ Backup created: ${BACKUP_FILE}.gz${NC}"
}

# Function to restore backup
restore_backup() {
    if [ -z "$1" ]; then
        echo -e "${RED}❌ Please provide backup file path${NC}"
        echo "Usage: $0 restore <backup_file>"
        exit 1
    fi
    
    BACKUP_FILE="$1"
    
    if [ ! -f "$BACKUP_FILE" ]; then
        echo -e "${RED}❌ Backup file not found: $BACKUP_FILE${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}🔄 Restoring database from backup...${NC}"
    echo -e "${RED}⚠️  This will overwrite the current database!${NC}"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Stop services
        docker-compose -f "$COMPOSE_FILE" down
        
        # Restore backup
        if [[ "$BACKUP_FILE" == *.gz ]]; then
            gunzip -c "$BACKUP_FILE" | docker-compose -f "$COMPOSE_FILE" exec -T postgres psql -U synprod -d synprod
        else
            docker-compose -f "$COMPOSE_FILE" exec -T postgres psql -U synprod -d synprod < "$BACKUP_FILE"
        fi
        
        # Start services
        docker-compose -f "$COMPOSE_FILE" up -d
        
        echo -e "${GREEN}✅ Database restored from backup${NC}"
    else
        echo -e "${YELLOW}ℹ️  Restore cancelled${NC}"
    fi
}

# Function to update services
update_services() {
    echo -e "${YELLOW}🔄 Updating services...${NC}"
    
    # Pull latest images
    docker-compose -f "$COMPOSE_FILE" pull
    
    # Rebuild and restart
    docker-compose -f "$COMPOSE_FILE" up -d --build
    
    echo -e "${GREEN}✅ Services updated${NC}"
}

# Function to clean up Docker resources
clean_docker() {
    echo -e "${YELLOW}🧹 Cleaning up Docker resources...${NC}"
    
    # Remove unused containers
    docker container prune -f
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    # Remove unused networks
    docker network prune -f
    
    echo -e "${GREEN}✅ Docker cleanup completed${NC}"
}

# Function to check service health
check_health() {
    echo -e "${YELLOW}🏥 Checking service health...${NC}"
    echo -e "${BLUE}============================${NC}"
    
    # Check PostgreSQL
    echo -n "PostgreSQL: "
    if docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U synprod >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Healthy${NC}"
    else
        echo -e "${RED}❌ Unhealthy${NC}"
    fi
    
    # Check Backend
    echo -n "Backend: "
    if curl -f http://localhost:8080/api/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Healthy${NC}"
    else
        echo -e "${RED}❌ Unhealthy${NC}"
    fi
    
    # Check Nginx
    echo -n "Nginx: "
    if curl -f http://localhost/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Healthy${NC}"
    else
        echo -e "${RED}❌ Unhealthy${NC}"
    fi
}

# Function to open shell in backend
open_shell() {
    echo -e "${YELLOW}🐚 Opening shell in backend container...${NC}"
    docker-compose -f "$COMPOSE_FILE" exec backend /bin/bash
}

# Function to open database shell
open_db_shell() {
    echo -e "${YELLOW}🗄️  Opening PostgreSQL shell...${NC}"
    docker-compose -f "$COMPOSE_FILE" exec postgres psql -U synprod -d synprod
}

# Main function
main() {
    case "${1:-}" in
        "status")
            show_status
            ;;
        "logs")
            show_logs
            ;;
        "restart")
            restart_services
            ;;
        "stop")
            stop_services
            ;;
        "start")
            start_services
            ;;
        "backup")
            create_backup
            ;;
        "restore")
            restore_backup "$2"
            ;;
        "update")
            update_services
            ;;
        "clean")
            clean_docker
            ;;
        "health")
            check_health
            ;;
        "shell")
            open_shell
            ;;
        "db-shell")
            open_db_shell
            ;;
        *)
            show_usage
            ;;
    esac
}

# Run main function
main "$@"
