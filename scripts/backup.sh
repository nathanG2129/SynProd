#!/bin/bash

# Database backup script for SynProd
# This script creates automated backups of the PostgreSQL database

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
COMPOSE_FILE="docker-compose.prod.yml"
CONTAINER_NAME="synprod_postgres_prod"
DB_NAME="${POSTGRES_DB:-synprod}"
DB_USER="${POSTGRES_USER:-synprod}"
RETENTION_DAYS=30
MAX_BACKUPS=10

echo -e "${GREEN}💾 SynProd Database Backup${NC}"
echo -e "${BLUE}=========================${NC}"

# Function to check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
        exit 1
    fi
    
    # Check if container exists and is running
    if ! docker ps | grep -q "$CONTAINER_NAME"; then
        echo -e "${RED}❌ PostgreSQL container '$CONTAINER_NAME' is not running.${NC}"
        echo -e "${YELLOW}💡 Please start the application with: docker-compose -f $COMPOSE_FILE up -d${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Prerequisites check passed${NC}"
}

# Function to create backup directory
create_backup_directory() {
    echo -e "${YELLOW}📁 Creating backup directory...${NC}"
    
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        echo -e "${GREEN}✅ Backup directory created: $BACKUP_DIR${NC}"
    else
        echo -e "${GREEN}✅ Backup directory exists: $BACKUP_DIR${NC}"
    fi
}

# Function to create database backup
create_backup() {
    echo -e "${YELLOW}🗄️  Creating database backup...${NC}"
    
    # Generate timestamp
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="$BACKUP_DIR/synprod_backup_$TIMESTAMP.sql"
    BACKUP_FILE_COMPRESSED="$BACKUP_FILE.gz"
    
    echo -e "${YELLOW}📋 Backup file: $BACKUP_FILE${NC}"
    
    # Create backup
    echo -e "${YELLOW}🔄 Executing pg_dump...${NC}"
    if docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" --verbose --no-password > "$BACKUP_FILE"; then
        echo -e "${GREEN}✅ Database backup created successfully${NC}"
    else
        echo -e "${RED}❌ Database backup failed${NC}"
        exit 1
    fi
    
    # Compress backup
    echo -e "${YELLOW}🗜️  Compressing backup...${NC}"
    if gzip "$BACKUP_FILE"; then
        echo -e "${GREEN}✅ Backup compressed: $BACKUP_FILE_COMPRESSED${NC}"
    else
        echo -e "${RED}❌ Backup compression failed${NC}"
        exit 1
    fi
    
    # Get backup size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE_COMPRESSED" | cut -f1)
    echo -e "${GREEN}📊 Backup size: $BACKUP_SIZE${NC}"
}

# Function to verify backup
verify_backup() {
    echo -e "${YELLOW}🔍 Verifying backup integrity...${NC}"
    
    # Check if backup file exists and is not empty
    if [ -f "$BACKUP_FILE_COMPRESSED" ] && [ -s "$BACKUP_FILE_COMPRESSED" ]; then
        echo -e "${GREEN}✅ Backup file exists and is not empty${NC}"
    else
        echo -e "${RED}❌ Backup file is missing or empty${NC}"
        exit 1
    fi
    
    # Test decompression
    if gunzip -t "$BACKUP_FILE_COMPRESSED" 2>/dev/null; then
        echo -e "${GREEN}✅ Backup file is not corrupted${NC}"
    else
        echo -e "${RED}❌ Backup file is corrupted${NC}"
        exit 1
    fi
    
    # Check backup content
    if gunzip -c "$BACKUP_FILE_COMPRESSED" | head -20 | grep -q "PostgreSQL database dump"; then
        echo -e "${GREEN}✅ Backup contains valid PostgreSQL dump${NC}"
    else
        echo -e "${RED}❌ Backup does not contain valid PostgreSQL dump${NC}"
        exit 1
    fi
}

# Function to cleanup old backups
cleanup_old_backups() {
    echo -e "${YELLOW}🧹 Cleaning up old backups...${NC}"
    
    # Remove backups older than retention period
    if find "$BACKUP_DIR" -name "synprod_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null; then
        echo -e "${GREEN}✅ Removed backups older than $RETENTION_DAYS days${NC}"
    fi
    
    # Keep only the most recent backups
    BACKUP_COUNT=$(find "$BACKUP_DIR" -name "synprod_backup_*.sql.gz" | wc -l)
    if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
        echo -e "${YELLOW}📊 Found $BACKUP_COUNT backups, keeping only $MAX_BACKUPS most recent${NC}"
        find "$BACKUP_DIR" -name "synprod_backup_*.sql.gz" -printf '%T@ %p\n' | sort -n | head -n -$MAX_BACKUPS | cut -d' ' -f2- | xargs rm -f
        echo -e "${GREEN}✅ Cleanup completed${NC}"
    else
        echo -e "${GREEN}✅ Backup count ($BACKUP_COUNT) is within limit ($MAX_BACKUPS)${NC}"
    fi
}

# Function to show backup summary
show_backup_summary() {
    echo -e "${GREEN}🎉 Backup completed successfully!${NC}"
    echo -e "${BLUE}===============================${NC}"
    
    echo -e "${YELLOW}📊 Backup Summary:${NC}"
    echo -e "  Database: $DB_NAME"
    echo -e "  User: $DB_USER"
    echo -e "  Backup File: $BACKUP_FILE_COMPRESSED"
    echo -e "  Backup Size: $BACKUP_SIZE"
    echo -e "  Timestamp: $(date)"
    
    echo -e "\n${YELLOW}📋 Available Backups:${NC}"
    if [ -d "$BACKUP_DIR" ]; then
        ls -lh "$BACKUP_DIR"/synprod_backup_*.sql.gz 2>/dev/null | awk '{print "  " $9 " (" $5 ", " $6 " " $7 " " $8 ")"}' || echo "  No backups found"
    else
        echo "  No backup directory found"
    fi
    
    echo -e "\n${YELLOW}📋 Next Steps:${NC}"
    echo -e "  • Test restore: ./scripts/restore.sh $BACKUP_FILE_COMPRESSED"
    echo -e "  • Schedule backups: Add to crontab for automated backups"
    echo -e "  • Monitor backup directory: Check disk space regularly"
}

# Function to create backup metadata
create_backup_metadata() {
    echo -e "${YELLOW}📝 Creating backup metadata...${NC}"
    
    METADATA_FILE="$BACKUP_DIR/synprod_backup_$TIMESTAMP.meta"
    
    cat > "$METADATA_FILE" << EOF
# SynProd Database Backup Metadata
# Generated: $(date)
# Database: $DB_NAME
# User: $DB_USER
# Container: $CONTAINER_NAME
# Backup File: synprod_backup_$TIMESTAMP.sql.gz
# Backup Size: $BACKUP_SIZE
# PostgreSQL Version: $(docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT version();" | tr -d ' ')
# Database Size: $(docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));" | tr -d ' ')
EOF
    
    echo -e "${GREEN}✅ Backup metadata created: $METADATA_FILE${NC}"
}

# Main backup process
main() {
    check_prerequisites
    create_backup_directory
    create_backup
    verify_backup
    create_backup_metadata
    cleanup_old_backups
    show_backup_summary
}

# Run main function
main "$@"
