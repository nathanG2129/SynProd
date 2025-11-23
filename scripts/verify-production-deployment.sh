#!/bin/bash
# Production Deployment Verification Script
# Run this script on your production server before deploying

set -e

echo "=========================================="
echo "SynProd Production Deployment Check"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check 1: Server Timezone
echo "1. Checking Server Timezone..."
if command_exists timedatectl; then
    TIMEZONE=$(timedatectl | grep "Time zone" | awk '{print $3}')
    SYSTEM_TIME=$(date +"%Y-%m-%d %H:%M:%S %Z")
    UTC_TIME=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
    
    echo "   System Timezone: $TIMEZONE"
    echo "   System Time: $SYSTEM_TIME"
    echo "   UTC Time: $UTC_TIME"
    
    # Check if system time is synchronized
    if timedatectl | grep -q "System clock synchronized: yes"; then
        echo -e "   ${GREEN}✓ System clock is synchronized${NC}"
    else
        echo -e "   ${YELLOW}⚠ System clock may not be synchronized${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # Check if NTP is enabled
    if timedatectl | grep -q "NTP service: active"; then
        echo -e "   ${GREEN}✓ NTP service is active${NC}"
    else
        echo -e "   ${YELLOW}⚠ NTP service is not active - time may drift${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    # Fallback for systems without timedatectl
    SYSTEM_TIME=$(date)
    UTC_TIME=$(date -u)
    echo "   System Time: $SYSTEM_TIME"
    echo "   UTC Time: $UTC_TIME"
    echo -e "   ${YELLOW}⚠ timedatectl not available - manual timezone check required${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# Check 2: Docker/Docker Compose
echo "2. Checking Docker Environment..."
if command_exists docker; then
    DOCKER_VERSION=$(docker --version)
    echo "   $DOCKER_VERSION"
    echo -e "   ${GREEN}✓ Docker is installed${NC}"
    
    if command_exists docker-compose; then
        COMPOSE_VERSION=$(docker-compose --version)
        echo "   $COMPOSE_VERSION"
        echo -e "   ${GREEN}✓ Docker Compose is installed${NC}"
    else
        echo -e "   ${RED}✗ Docker Compose not found${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "   ${RED}✗ Docker not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Check 3: Required Environment Variables
echo "3. Checking Environment Variables..."
ENV_FILE="${1:-.env}"

if [ -f "$ENV_FILE" ]; then
    echo "   Reading from: $ENV_FILE"
    
    # Check critical backend variables
    REQUIRED_VARS=(
        "JWT_SECRET"
        "DATABASE_PASSWORD"
        "POSTGRES_PASSWORD"
        "MAIL_USERNAME"
        "MAIL_PASSWORD"
    )
    
    MISSING_VARS=()
    for VAR in "${REQUIRED_VARS[@]}"; do
        if grep -q "^${VAR}=" "$ENV_FILE" 2>/dev/null || grep -q "^${VAR} " "$ENV_FILE" 2>/dev/null; then
            echo -e "   ${GREEN}✓ $VAR is set${NC}"
        else
            echo -e "   ${RED}✗ $VAR is missing${NC}"
            MISSING_VARS+=("$VAR")
        fi
    done
    
    if [ ${#MISSING_VARS[@]} -gt 0 ]; then
        ERRORS=$((ERRORS + ${#MISSING_VARS[@]}))
    fi
    
    # Check optional but recommended variables
    OPTIONAL_VARS=(
        "FRONTEND_URL"
        "ALLOWED_ORIGINS"
        "VITE_API_BASE_URL"
    )
    
    for VAR in "${OPTIONAL_VARS[@]}"; do
        if grep -q "^${VAR}=" "$ENV_FILE" 2>/dev/null || grep -q "^${VAR} " "$ENV_FILE" 2>/dev/null; then
            echo -e "   ${GREEN}✓ $VAR is set${NC}"
        else
            echo -e "   ${YELLOW}⚠ $VAR not set (using default)${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    done
else
    echo -e "   ${YELLOW}⚠ $ENV_FILE not found${NC}"
    echo "   Creating .env file is recommended"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# Check 4: Nginx Configuration
echo "4. Checking Nginx Configuration..."
if [ -f "nginx/nginx.conf" ]; then
    # Check for try_files directive (SPA routing)
    if grep -q "try_files.*index.html" nginx/nginx.conf; then
        echo -e "   ${GREEN}✓ SPA routing (try_files) configured${NC}"
    else
        echo -e "   ${RED}✗ SPA routing not configured - deep links will 404${NC}"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check for /api/ proxy_pass
    if grep -q "location /api/" nginx/nginx.conf && grep -q "proxy_pass" nginx/nginx.conf; then
        echo -e "   ${GREEN}✓ API proxy configured${NC}"
    else
        echo -e "   ${RED}✗ API proxy not configured${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "   ${YELLOW}⚠ nginx/nginx.conf not found${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# Check 5: Port Availability
echo "5. Checking Port Availability..."
PORTS=(80 443 8080 5432)

for PORT in "${PORTS[@]}"; do
    if command_exists netstat; then
        if netstat -tuln | grep -q ":${PORT} "; then
            echo -e "   ${YELLOW}⚠ Port $PORT is in use${NC}"
            WARNINGS=$((WARNINGS + 1))
        else
            echo -e "   ${GREEN}✓ Port $PORT is available${NC}"
        fi
    elif command_exists ss; then
        if ss -tuln | grep -q ":${PORT} "; then
            echo -e "   ${YELLOW}⚠ Port $PORT is in use${NC}"
            WARNINGS=$((WARNINGS + 1))
        else
            echo -e "   ${GREEN}✓ Port $PORT is available${NC}"
        fi
    else
        echo -e "   ${YELLOW}⚠ Cannot check ports (netstat/ss not available)${NC}"
        WARNINGS=$((WARNINGS + 1))
        break
    fi
done

echo ""

# Check 6: Disk Space
echo "6. Checking Disk Space..."
if command_exists df; then
    DISK_USAGE=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -lt 80 ]; then
        echo -e "   ${GREEN}✓ Disk usage: ${DISK_USAGE}% (healthy)${NC}"
    elif [ "$DISK_USAGE" -lt 90 ]; then
        echo -e "   ${YELLOW}⚠ Disk usage: ${DISK_USAGE}% (getting full)${NC}"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "   ${RED}✗ Disk usage: ${DISK_USAGE}% (critical)${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "   ${YELLOW}⚠ Cannot check disk space${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# Summary
echo "=========================================="
echo "Summary"
echo "=========================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Ready for deployment.${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS warning(s) found. Review and fix before deployment.${NC}"
    exit 0
else
    echo -e "${RED}✗ $ERRORS error(s) and $WARNINGS warning(s) found.${NC}"
    echo "Please fix errors before deploying."
    exit 1
fi

