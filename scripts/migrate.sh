#!/bin/bash

# Database migration script for SynProd
# This script handles database schema migrations and updates

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
MIGRATIONS_DIR="./migrations"
BACKUP_DIR="./backups"

echo -e "${GREEN}🔄 SynProd Database Migration${NC}"
echo -e "${BLUE}============================${NC}"

# Function to show usage
show_usage() {
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  status        Show migration status"
    echo "  create        Create a new migration file"
    echo "  up            Apply all pending migrations"
    echo "  down          Rollback the last migration"
    echo "  reset         Reset database to initial state"
    echo "  validate      Validate current database schema"
    echo "  backup        Create backup before migration"
    echo "  restore       Restore from backup"
    echo ""
    echo "Options:"
    echo "  --force       Skip confirmation prompts"
    echo "  --dry-run     Show what would be done without executing"
    echo "  --help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 status"
    echo "  $0 create add_user_table"
    echo "  $0 up --dry-run"
    echo "  $0 down --force"
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
    
    # Create migrations directory if it doesn't exist
    if [ ! -d "$MIGRATIONS_DIR" ]; then
        mkdir -p "$MIGRATIONS_DIR"
        echo -e "${GREEN}✅ Created migrations directory: $MIGRATIONS_DIR${NC}"
    fi
    
    echo -e "${GREEN}✅ Prerequisites check passed${NC}"
}

# Function to create migration table
create_migration_table() {
    echo -e "${YELLOW}📋 Creating migration tracking table...${NC}"
    
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id SERIAL PRIMARY KEY,
            version VARCHAR(255) NOT NULL UNIQUE,
            description TEXT,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            checksum VARCHAR(255)
        );
    " >/dev/null 2>&1
    
    echo -e "${GREEN}✅ Migration tracking table ready${NC}"
}

# Function to show migration status
show_migration_status() {
    echo -e "${YELLOW}📊 Migration Status${NC}"
    echo -e "${BLUE}==================${NC}"
    
    # Create migration table if it doesn't exist
    create_migration_table
    
    # Show applied migrations
    echo -e "${YELLOW}✅ Applied Migrations:${NC}"
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "
        SELECT '  ' || version || ' - ' || description || ' (' || applied_at || ')'
        FROM schema_migrations 
        ORDER BY applied_at;
    " 2>/dev/null || echo "  No migrations applied yet"
    
    # Show pending migrations
    echo -e "\n${YELLOW}⏳ Pending Migrations:${NC}"
    if [ -d "$MIGRATIONS_DIR" ] && [ "$(ls -A "$MIGRATIONS_DIR" 2>/dev/null)" ]; then
        for migration_file in "$MIGRATIONS_DIR"/*.sql; do
            if [ -f "$migration_file" ]; then
                version=$(basename "$migration_file" .sql)
                if ! docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT 1 FROM schema_migrations WHERE version = '$version';" 2>/dev/null | grep -q "1"; then
                    echo "  $version - $(head -1 "$migration_file" | sed 's/^-- //')"
                fi
            fi
        done
    else
        echo "  No migration files found"
    fi
    
    # Show database schema info
    echo -e "\n${YELLOW}📋 Database Schema Info:${NC}"
    TABLE_COUNT=$(docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
    echo -e "  Tables: $TABLE_COUNT"
    
    DB_SIZE=$(docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));" | tr -d ' ')
    echo -e "  Database Size: $DB_SIZE"
}

# Function to create new migration
create_migration() {
    local migration_name="$1"
    
    if [ -z "$migration_name" ]; then
        echo -e "${RED}❌ Migration name is required${NC}"
        echo "Usage: $0 create <migration_name>"
        exit 1
    fi
    
    # Generate timestamp
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local migration_file="$MIGRATIONS_DIR/${timestamp}_${migration_name}.sql"
    
    echo -e "${YELLOW}📝 Creating migration: $migration_name${NC}"
    
    # Create migration file template
    cat > "$migration_file" << EOF
-- Migration: $migration_name
-- Created: $(date)
-- Description: [Add description here]

-- Up migration
BEGIN;

-- Add your migration SQL here
-- Example:
-- CREATE TABLE example_table (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

COMMIT;

-- Down migration (rollback)
-- BEGIN;
-- DROP TABLE IF EXISTS example_table;
-- COMMIT;
EOF
    
    echo -e "${GREEN}✅ Migration file created: $migration_file${NC}"
    echo -e "${YELLOW}💡 Edit the file to add your migration SQL${NC}"
}

# Function to apply migrations
apply_migrations() {
    local dry_run="$1"
    
    echo -e "${YELLOW}🔄 Applying migrations...${NC}"
    
    # Create migration table if it doesn't exist
    create_migration_table
    
    local applied_count=0
    
    if [ -d "$MIGRATIONS_DIR" ] && [ "$(ls -A "$MIGRATIONS_DIR" 2>/dev/null)" ]; then
        for migration_file in "$MIGRATIONS_DIR"/*.sql; do
            if [ -f "$migration_file" ]; then
                local version=$(basename "$migration_file" .sql)
                local description=$(head -1 "$migration_file" | sed 's/^-- Migration: //')
                
                # Check if migration is already applied
                if ! docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT 1 FROM schema_migrations WHERE version = '$version';" 2>/dev/null | grep -q "1"; then
                    echo -e "${YELLOW}📋 Applying migration: $version${NC}"
                    
                    if [ "$dry_run" = "true" ]; then
                        echo -e "${YELLOW}🔍 Dry run - would apply: $migration_file${NC}"
                        head -20 "$migration_file"
                        echo -e "${YELLOW}... (showing first 20 lines)${NC}"
                    else
                        # Apply migration
                        if docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" < "$migration_file"; then
                            # Record migration
                            local checksum=$(md5sum "$migration_file" | cut -d' ' -f1)
                            docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "
                                INSERT INTO schema_migrations (version, description, checksum) 
                                VALUES ('$version', '$description', '$checksum');
                            " >/dev/null 2>&1
                            
                            echo -e "${GREEN}✅ Applied migration: $version${NC}"
                            ((applied_count++))
                        else
                            echo -e "${RED}❌ Failed to apply migration: $version${NC}"
                            exit 1
                        fi
                    fi
                fi
            fi
        done
    fi
    
    if [ "$dry_run" = "true" ]; then
        echo -e "${GREEN}✅ Dry run completed. $applied_count migrations would be applied.${NC}"
    else
        echo -e "${GREEN}✅ Migration completed. $applied_count migrations applied.${NC}"
    fi
}

# Function to rollback last migration
rollback_migration() {
    local force="$1"
    
    echo -e "${YELLOW}🔄 Rolling back last migration...${NC}"
    
    # Get last applied migration
    local last_migration=$(docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "
        SELECT version FROM schema_migrations 
        ORDER BY applied_at DESC 
        LIMIT 1;
    " 2>/dev/null | tr -d ' ')
    
    if [ -z "$last_migration" ]; then
        echo -e "${YELLOW}ℹ️  No migrations to rollback${NC}"
        return 0
    fi
    
    echo -e "${YELLOW}📋 Last applied migration: $last_migration${NC}"
    
    if [ "$force" != "true" ]; then
        read -p "Are you sure you want to rollback this migration? (yes/no): " -r
        if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            echo -e "${YELLOW}ℹ️  Rollback cancelled${NC}"
            return 0
        fi
    fi
    
    # Find migration file
    local migration_file="$MIGRATIONS_DIR/${last_migration}.sql"
    
    if [ ! -f "$migration_file" ]; then
        echo -e "${RED}❌ Migration file not found: $migration_file${NC}"
        exit 1
    fi
    
    # Extract down migration (if exists)
    local down_sql=$(awk '/^-- Down migration/,/^-- COMMIT;/' "$migration_file" | grep -v '^--' | grep -v '^$')
    
    if [ -z "$down_sql" ]; then
        echo -e "${RED}❌ No rollback SQL found in migration file${NC}"
        exit 1
    fi
    
    # Execute rollback
    echo -e "${YELLOW}🔄 Executing rollback...${NC}"
    if echo "$down_sql" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"; then
        # Remove migration record
        docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "
            DELETE FROM schema_migrations WHERE version = '$last_migration';
        " >/dev/null 2>&1
        
        echo -e "${GREEN}✅ Rollback completed: $last_migration${NC}"
    else
        echo -e "${RED}❌ Rollback failed: $last_migration${NC}"
        exit 1
    fi
}

# Function to reset database
reset_database() {
    local force="$1"
    
    echo -e "${RED}⚠️  WARNING: This will reset the database to initial state!${NC}"
    echo -e "${YELLOW}📋 This will:${NC}"
    echo -e "  • Drop all tables and data"
    echo -e "  • Clear migration history"
    echo -e "  • Recreate initial schema"
    echo ""
    
    if [ "$force" != "true" ]; then
        read -p "Are you sure you want to reset the database? (yes/no): " -r
        if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            echo -e "${YELLOW}ℹ️  Reset cancelled${NC}"
            return 0
        fi
    fi
    
    # Create backup before reset
    echo -e "${YELLOW}💾 Creating backup before reset...${NC}"
    ./scripts/backup.sh
    
    # Stop application services
    echo -e "${YELLOW}🛑 Stopping application services...${NC}"
    docker-compose -f "$COMPOSE_FILE" stop backend nginx 2>/dev/null || true
    
    # Drop and recreate database
    echo -e "${YELLOW}🗑️  Dropping database...${NC}"
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
    
    echo -e "${YELLOW}🆕 Creating new database...${NC}"
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;"
    
    # Start application services (this will recreate the schema)
    echo -e "${YELLOW}🚀 Starting application services...${NC}"
    docker-compose -f "$COMPOSE_FILE" start backend nginx
    
    echo -e "${GREEN}✅ Database reset completed${NC}"
}

# Function to validate schema
validate_schema() {
    echo -e "${YELLOW}🔍 Validating database schema...${NC}"
    
    # Check if database is accessible
    if ! docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" >/dev/null 2>&1; then
        echo -e "${RED}❌ Database is not accessible${NC}"
        exit 1
    fi
    
    # Check required tables
    local required_tables=("users" "products" "product_composition" "product_ingredient")
    local missing_tables=()
    
    for table in "${required_tables[@]}"; do
        if ! docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT 1 FROM information_schema.tables WHERE table_name = '$table';" 2>/dev/null | grep -q "1"; then
            missing_tables+=("$table")
        fi
    done
    
    if [ ${#missing_tables[@]} -eq 0 ]; then
        echo -e "${GREEN}✅ All required tables exist${NC}"
    else
        echo -e "${RED}❌ Missing required tables: ${missing_tables[*]}${NC}"
        exit 1
    fi
    
    # Check table constraints
    echo -e "${YELLOW}🔍 Checking table constraints...${NC}"
    local constraint_count=$(docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = 'public';" | tr -d ' ')
    echo -e "${GREEN}✅ Found $constraint_count constraints${NC}"
    
    # Check indexes
    echo -e "${YELLOW}🔍 Checking indexes...${NC}"
    local index_count=$(docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';" | tr -d ' ')
    echo -e "${GREEN}✅ Found $index_count indexes${NC}"
    
    echo -e "${GREEN}✅ Schema validation completed${NC}"
}

# Main function
main() {
    local command="${1:-}"
    local force=false
    local dry_run=false
    
    # Parse options
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
                if [ -z "$command" ]; then
                    command="$1"
                fi
                shift
                ;;
        esac
    done
    
    # Check prerequisites
    check_prerequisites
    
    # Execute command
    case "$command" in
        "status")
            show_migration_status
            ;;
        "create")
            create_migration "$2"
            ;;
        "up")
            apply_migrations "$dry_run"
            ;;
        "down")
            rollback_migration "$force"
            ;;
        "reset")
            reset_database "$force"
            ;;
        "validate")
            validate_schema
            ;;
        "backup")
            ./scripts/backup.sh
            ;;
        "restore")
            ./scripts/restore.sh "$2"
            ;;
        "")
            show_usage
            ;;
        *)
            echo -e "${RED}❌ Unknown command: $command${NC}"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
