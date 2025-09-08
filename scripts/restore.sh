#!/bin/bash

# Database restore script for SynProd
# This script restores the PostgreSQL database from a backup file

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
CONTAINER_NAME="synprod_postgres_prod"
DB_NAME="${POSTGRES_DB:-synprod}"
DB_USER="${POSTGRES_USER:-synprod}"

echo -e "${GREEN}🔄 SynProd Database Restore${NC}"
echo -e "${BLUE}=========================${NC}"

# Function to show usage
show_usage() {
    echo "Usage: $0 <backup_file> [options]"
    echo ""
    echo "Arguments:"
    echo "  backup_file    Path to the backup file (.sql or .sql.gz)"
    echo ""
    echo "Options:"
    echo "  --force        Skip confirmation prompt"
    echo "  --dry-run      Show what would be restored without executing"
    echo "  --help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 backups/synprod_backup_20240115_103000.sql.gz"
    echo "  $0 backups/synprod_backup_20240115_103000.sql.gz --force"
    echo "  $0 backups/synprod_backup_20240115_103000.sql.gz --dry-run"
}

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

# Function to validate backup file
validate_backup_file() {
    local backup_file="$1"
    
    echo -e "${YELLOW}🔍 Validating backup file...${NC}"
    
    # Check if file exists
    if [ ! -f "$backup_file" ]; then
        echo -e "${RED}❌ Backup file not found: $backup_file${NC}"
        exit 1
    fi
    
    # Check if file is not empty
    if [ ! -s "$backup_file" ]; then
        echo -e "${RED}❌ Backup file is empty: $backup_file${NC}"
        exit 1
    fi
    
    # Check file type and decompress if needed
    if [[ "$backup_file" == *.gz ]]; then
        echo -e "${YELLOW}🗜️  Detected compressed backup file${NC}"
        if gunzip -t "$backup_file" 2>/dev/null; then
            echo -e "${GREEN}✅ Compressed backup file is valid${NC}"
        else
            echo -e "${RED}❌ Compressed backup file is corrupted${NC}"
            exit 1
        fi
    elif [[ "$backup_file" == *.sql ]]; then
        echo -e "${YELLOW}📄 Detected SQL backup file${NC}"
        if head -20 "$backup_file" | grep -q "PostgreSQL database dump"; then
            echo -e "${GREEN}✅ SQL backup file is valid${NC}"
        else
            echo -e "${RED}❌ SQL backup file does not contain valid PostgreSQL dump${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Unsupported backup file format. Expected .sql or .sql.gz${NC}"
        exit 1
    fi
    
    # Get backup file size
    BACKUP_SIZE=$(du -h "$backup_file" | cut -f1)
    echo -e "${GREEN}📊 Backup file size: $BACKUP_SIZE${NC}"
}

# Function to show backup information
show_backup_info() {
    local backup_file="$1"
    
    echo -e "${YELLOW}📋 Backup Information:${NC}"
    echo -e "  File: $backup_file"
    echo -e "  Size: $BACKUP_SIZE"
    echo -e "  Modified: $(stat -c %y "$backup_file" 2>/dev/null || stat -f %Sm "$backup_file" 2>/dev/null || echo "Unknown")"
    
    # Try to extract metadata if available
    local metadata_file="${backup_file%.*}.meta"
    if [ -f "$metadata_file" ]; then
        echo -e "  Metadata: Available"
        echo -e "${YELLOW}📝 Backup Metadata:${NC}"
        grep -E "^# (Database|User|Generated|PostgreSQL Version|Database Size):" "$metadata_file" 2>/dev/null || echo "  No metadata details available"
    else
        echo -e "  Metadata: Not available"
    fi
}

# Function to create pre-restore backup
create_pre_restore_backup() {
    echo -e "${YELLOW}💾 Creating pre-restore backup...${NC}"
    
    local pre_restore_backup="./backups/pre_restore_$(date +%Y%m%d_%H%M%S).sql.gz"
    
    if docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" --verbose --no-password | gzip > "$pre_restore_backup"; then
        echo -e "${GREEN}✅ Pre-restore backup created: $pre_restore_backup${NC}"
        echo -e "${YELLOW}💡 This backup can be used to restore the current state if needed${NC}"
    else
        echo -e "${RED}❌ Failed to create pre-restore backup${NC}"
        exit 1
    fi
}

# Function to confirm restore operation
confirm_restore() {
    local backup_file="$1"
    
    echo -e "${RED}⚠️  WARNING: This operation will overwrite the current database!${NC}"
    echo -e "${YELLOW}📋 Restore Details:${NC}"
    echo -e "  Target Database: $DB_NAME"
    echo -e "  Target User: $DB_USER"
    echo -e "  Backup File: $backup_file"
    echo -e "  Container: $CONTAINER_NAME"
    echo ""
    echo -e "${YELLOW}💡 A pre-restore backup will be created automatically${NC}"
    echo ""
    
    read -p "Are you sure you want to proceed? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        echo -e "${YELLOW}ℹ️  Restore operation cancelled${NC}"
        exit 0
    fi
}

# Function to perform dry run
perform_dry_run() {
    local backup_file="$1"
    
    echo -e "${YELLOW}🔍 Performing dry run...${NC}"
    
    # Show what would be restored
    if [[ "$backup_file" == *.gz ]]; then
        echo -e "${YELLOW}📋 Backup file contents (first 20 lines):${NC}"
        gunzip -c "$backup_file" | head -20
    else
        echo -e "${YELLOW}📋 Backup file contents (first 20 lines):${NC}"
        head -20 "$backup_file"
    fi
    
    echo -e "\n${YELLOW}📊 Database information that would be restored:${NC}"
    if [[ "$backup_file" == *.gz ]]; then
        gunzip -c "$backup_file" | grep -E "^(CREATE|INSERT|COPY)" | head -10
    else
        grep -E "^(CREATE|INSERT|COPY)" "$backup_file" | head -10
    fi
    
    echo -e "\n${GREEN}✅ Dry run completed. No changes were made to the database.${NC}"
}

# Function to perform restore
perform_restore() {
    local backup_file="$1"
    
    echo -e "${YELLOW}🔄 Starting database restore...${NC}"
    
    # Create pre-restore backup
    create_pre_restore_backup
    
    # Stop application services to prevent data corruption
    echo -e "${YELLOW}🛑 Stopping application services...${NC}"
    docker-compose -f "$COMPOSE_FILE" stop backend nginx 2>/dev/null || true
    
    # Wait a moment for services to stop
    sleep 2
    
    # Drop and recreate database
    echo -e "${YELLOW}🗑️  Dropping existing database...${NC}"
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
    
    echo -e "${YELLOW}🆕 Creating new database...${NC}"
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;"
    
    # Restore database
    echo -e "${YELLOW}📥 Restoring database from backup...${NC}"
    if [[ "$backup_file" == *.gz ]]; then
        if gunzip -c "$backup_file" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" --verbose; then
            echo -e "${GREEN}✅ Database restored successfully from compressed backup${NC}"
        else
            echo -e "${RED}❌ Database restore failed${NC}"
            exit 1
        fi
    else
        if docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" --verbose < "$backup_file"; then
            echo -e "${GREEN}✅ Database restored successfully from SQL backup${NC}"
        else
            echo -e "${RED}❌ Database restore failed${NC}"
            exit 1
        fi
    fi
    
    # Start application services
    echo -e "${YELLOW}🚀 Starting application services...${NC}"
    docker-compose -f "$COMPOSE_FILE" start backend nginx
    
    # Wait for services to be ready
    echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
    sleep 10
    
    # Verify restore
    verify_restore
}

# Function to verify restore
verify_restore() {
    echo -e "${YELLOW}🔍 Verifying restore...${NC}"
    
    # Check if database is accessible
    if docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Database is accessible${NC}"
    else
        echo -e "${RED}❌ Database is not accessible${NC}"
        exit 1
    fi
    
    # Check table count
    TABLE_COUNT=$(docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
    echo -e "${GREEN}📊 Tables restored: $TABLE_COUNT${NC}"
    
    # Check if backend is responding
    echo -e "${YELLOW}🔍 Checking backend health...${NC}"
    if curl -f http://localhost:8080/actuator/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is responding${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend is not responding yet (may need more time to start)${NC}"
    fi
}

# Function to show restore summary
show_restore_summary() {
    echo -e "${GREEN}🎉 Database restore completed successfully!${NC}"
    echo -e "${BLUE}=====================================${NC}"
    
    echo -e "${YELLOW}📊 Restore Summary:${NC}"
    echo -e "  Database: $DB_NAME"
    echo -e "  User: $DB_USER"
    echo -e "  Backup File: $BACKUP_FILE"
    echo -e "  Tables Restored: $TABLE_COUNT"
    echo -e "  Timestamp: $(date)"
    
    echo -e "\n${YELLOW}📋 Next Steps:${NC}"
    echo -e "  • Verify application functionality"
    echo -e "  • Check data integrity"
    echo -e "  • Monitor application logs"
    echo -e "  • Test critical business functions"
    
    echo -e "\n${YELLOW}💡 Recovery Information:${NC}"
    echo -e "  • Pre-restore backup available in ./backups/"
    echo -e "  • Use restore script to revert if needed"
    echo -e "  • Monitor application for any issues"
}

# Main function
main() {
    local backup_file=""
    local force=false
    local dry_run=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --force)
                force=true
                shift
                ;;
            --dry-run)
                dry_run=true
                shift
                ;;
            --help)
                show_usage
                exit 0
                ;;
            -*)
                echo -e "${RED}❌ Unknown option: $1${NC}"
                show_usage
                exit 1
                ;;
            *)
                if [ -z "$backup_file" ]; then
                    backup_file="$1"
                else
                    echo -e "${RED}❌ Multiple backup files specified${NC}"
                    show_usage
                    exit 1
                fi
                shift
                ;;
        esac
    done
    
    # Check if backup file is provided
    if [ -z "$backup_file" ]; then
        echo -e "${RED}❌ Backup file is required${NC}"
        show_usage
        exit 1
    fi
    
    # Check prerequisites
    check_prerequisites
    
    # Validate backup file
    validate_backup_file "$backup_file"
    
    # Show backup information
    show_backup_info "$backup_file"
    
    # Perform dry run if requested
    if [ "$dry_run" = true ]; then
        perform_dry_run "$backup_file"
        exit 0
    fi
    
    # Confirm restore unless forced
    if [ "$force" = false ]; then
        confirm_restore "$backup_file"
    fi
    
    # Perform restore
    perform_restore "$backup_file"
    
    # Show summary
    show_restore_summary
}

# Run main function
main "$@"
