#!/bin/bash

# Backup scheduling script for SynProd
# This script sets up automated backup scheduling

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}📅 SynProd Backup Scheduling${NC}"
echo -e "${BLUE}===========================${NC}"

# Function to show usage
show_usage() {
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  install       Install backup scheduling"
    echo "  uninstall     Remove backup scheduling"
    echo "  status        Show backup schedule status"
    echo "  test          Test backup execution"
    echo "  logs          Show backup logs"
    echo ""
    echo "Options:"
    echo "  --help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 install"
    echo "  $0 status"
    echo "  $0 test"
}

# Function to install backup scheduling
install_scheduling() {
    echo -e "${YELLOW}📅 Installing backup scheduling...${NC}"
    
    # Get current directory
    local current_dir=$(pwd)
    local backup_script="$current_dir/scripts/backup.sh"
    
    # Check if backup script exists
    if [ ! -f "$backup_script" ]; then
        echo -e "${RED}❌ Backup script not found: $backup_script${NC}"
        exit 1
    fi
    
    # Make backup script executable
    chmod +x "$backup_script"
    
    # Create cron job
    local cron_job="0 2 * * * cd $current_dir && $backup_script >> logs/backup.log 2>&1"
    
    # Check if cron job already exists
    if crontab -l 2>/dev/null | grep -q "backup.sh"; then
        echo -e "${YELLOW}⚠️  Backup cron job already exists${NC}"
        echo -e "${YELLOW}Current cron jobs:${NC}"
        crontab -l | grep "backup.sh"
    else
        # Add cron job
        (crontab -l 2>/dev/null; echo "$cron_job") | crontab -
        echo -e "${GREEN}✅ Backup cron job installed${NC}"
        echo -e "${YELLOW}📋 Cron job: $cron_job${NC}"
    fi
    
    # Create logs directory
    mkdir -p logs
    
    # Create log rotation script
    create_log_rotation
    
    echo -e "${GREEN}✅ Backup scheduling installed successfully${NC}"
    echo -e "${YELLOW}💡 Backups will run daily at 2:00 AM${NC}"
    echo -e "${YELLOW}💡 Logs will be stored in logs/backup.log${NC}"
}

# Function to uninstall backup scheduling
uninstall_scheduling() {
    echo -e "${YELLOW}🗑️  Removing backup scheduling...${NC}"
    
    # Remove cron job
    if crontab -l 2>/dev/null | grep -q "backup.sh"; then
        crontab -l | grep -v "backup.sh" | crontab -
        echo -e "${GREEN}✅ Backup cron job removed${NC}"
    else
        echo -e "${YELLOW}ℹ️  No backup cron job found${NC}"
    fi
    
    echo -e "${GREEN}✅ Backup scheduling uninstalled${NC}"
}

# Function to show backup schedule status
show_status() {
    echo -e "${YELLOW}📊 Backup Schedule Status${NC}"
    echo -e "${BLUE}========================${NC}"
    
    # Check if cron service is running
    if systemctl is-active --quiet cron 2>/dev/null || systemctl is-active --quiet crond 2>/dev/null; then
        echo -e "${GREEN}✅ Cron service is running${NC}"
    else
        echo -e "${RED}❌ Cron service is not running${NC}"
        echo -e "${YELLOW}💡 Start cron service: sudo systemctl start cron${NC}"
    fi
    
    # Show current cron jobs
    echo -e "\n${YELLOW}📋 Current Cron Jobs:${NC}"
    if crontab -l 2>/dev/null | grep -q "backup.sh"; then
        crontab -l | grep "backup.sh"
    else
        echo "  No backup cron jobs found"
    fi
    
    # Show backup script status
    local backup_script="./scripts/backup.sh"
    if [ -f "$backup_script" ]; then
        if [ -x "$backup_script" ]; then
            echo -e "\n${GREEN}✅ Backup script is executable${NC}"
        else
            echo -e "\n${RED}❌ Backup script is not executable${NC}"
            echo -e "${YELLOW}💡 Make executable: chmod +x $backup_script${NC}"
        fi
    else
        echo -e "\n${RED}❌ Backup script not found: $backup_script${NC}"
    fi
    
    # Show backup directory status
    if [ -d "backups" ]; then
        local backup_count=$(find backups -name "synprod_backup_*.sql.gz" | wc -l)
        echo -e "\n${GREEN}✅ Backup directory exists${NC}"
        echo -e "${YELLOW}📊 Backup count: $backup_count${NC}"
    else
        echo -e "\n${YELLOW}⚠️  Backup directory does not exist${NC}"
    fi
    
    # Show log file status
    if [ -f "logs/backup.log" ]; then
        local log_size=$(du -h "logs/backup.log" | cut -f1)
        echo -e "\n${GREEN}✅ Backup log file exists${NC}"
        echo -e "${YELLOW}📊 Log file size: $log_size${NC}"
    else
        echo -e "\n${YELLOW}⚠️  Backup log file does not exist${NC}"
    fi
}

# Function to test backup execution
test_backup() {
    echo -e "${YELLOW}🧪 Testing backup execution...${NC}"
    
    # Check if backup script exists and is executable
    local backup_script="./scripts/backup.sh"
    if [ ! -f "$backup_script" ]; then
        echo -e "${RED}❌ Backup script not found: $backup_script${NC}"
        exit 1
    fi
    
    if [ ! -x "$backup_script" ]; then
        echo -e "${RED}❌ Backup script is not executable${NC}"
        echo -e "${YELLOW}💡 Making executable...${NC}"
        chmod +x "$backup_script"
    fi
    
    # Create logs directory if it doesn't exist
    mkdir -p logs
    
    # Run backup script
    echo -e "${YELLOW}🔄 Executing backup script...${NC}"
    if "$backup_script" >> logs/backup.log 2>&1; then
        echo -e "${GREEN}✅ Backup test completed successfully${NC}"
    else
        echo -e "${RED}❌ Backup test failed${NC}"
        echo -e "${YELLOW}💡 Check logs/backup.log for details${NC}"
        exit 1
    fi
    
    # Show recent log entries
    echo -e "\n${YELLOW}📋 Recent Backup Log Entries:${NC}"
    tail -10 logs/backup.log 2>/dev/null || echo "No log entries found"
}

# Function to show backup logs
show_logs() {
    echo -e "${YELLOW}📋 Backup Logs${NC}"
    echo -e "${BLUE}=============${NC}"
    
    if [ -f "logs/backup.log" ]; then
        echo -e "${YELLOW}📊 Log file size: $(du -h logs/backup.log | cut -f1)${NC}"
        echo -e "${YELLOW}📅 Last modified: $(stat -c %y logs/backup.log 2>/dev/null || stat -f %Sm logs/backup.log 2>/dev/null || echo "Unknown")${NC}"
        echo ""
        echo -e "${YELLOW}📋 Recent Log Entries (last 20 lines):${NC}"
        tail -20 logs/backup.log
    else
        echo -e "${YELLOW}⚠️  No backup log file found${NC}"
        echo -e "${YELLOW}💡 Logs will be created when backup runs${NC}"
    fi
}

# Function to create log rotation
create_log_rotation() {
    echo -e "${YELLOW}📝 Creating log rotation...${NC}"
    
    # Create logrotate configuration
    local logrotate_config="/etc/logrotate.d/synprod-backup"
    
    if [ -w "/etc/logrotate.d" ]; then
        cat > "$logrotate_config" << EOF
$(pwd)/logs/backup.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 $(whoami) $(whoami)
    postrotate
        # Reload cron if needed
        systemctl reload cron 2>/dev/null || true
    endscript
}
EOF
        echo -e "${GREEN}✅ Log rotation configured: $logrotate_config${NC}"
    else
        echo -e "${YELLOW}⚠️  Cannot create log rotation config (need sudo access)${NC}"
        echo -e "${YELLOW}💡 Manual log rotation recommended${NC}"
    fi
}

# Main function
main() {
    local command="${1:-}"
    
    case "$command" in
        "install")
            install_scheduling
            ;;
        "uninstall")
            uninstall_scheduling
            ;;
        "status")
            show_status
            ;;
        "test")
            test_backup
            ;;
        "logs")
            show_logs
            ;;
        "--help")
            show_usage
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
