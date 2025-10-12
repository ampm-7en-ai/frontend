#!/bin/bash

# Emergency Rollback Script for 7en.ai Deployments
# Usage: ./scripts/emergency-rollback.sh [environment] [backup-timestamp]
# Example: ./scripts/emergency-rollback.sh staging 2025-10-12-14-30-00

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1}
BACKUP_TIMESTAMP=${2}
BACKUP_BASE_DIR="/var/www/backups"

# Validate arguments
if [ -z "$ENVIRONMENT" ]; then
  echo -e "${RED}❌ Error: Environment not specified${NC}"
  echo "Usage: $0 [environment] [backup-timestamp]"
  echo "Example: $0 staging 2025-10-12-14-30-00"
  echo ""
  echo "Or run without timestamp to see available backups:"
  echo "Example: $0 staging"
  exit 1
fi

# Determine target directory based on environment
case $ENVIRONMENT in
  staging)
    TARGET_DIR="/var/www/staging.7en.ai"
    BACKUP_PREFIX="staging"
    ;;
  beta)
    TARGET_DIR="/var/www/beta.7en.ai"
    BACKUP_PREFIX="beta"
    ;;
  production|prod)
    TARGET_DIR="/var/www/7en.ai"
    BACKUP_PREFIX="production"
    ENVIRONMENT="production"
    ;;
  *)
    echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
    echo "Valid options: staging, beta, production"
    exit 1
    ;;
esac

# If no timestamp provided, list available backups
if [ -z "$BACKUP_TIMESTAMP" ]; then
  echo "======================================"
  echo "  Available Backups - $ENVIRONMENT"
  echo "======================================"
  echo ""
  
  if [ ! -d "$BACKUP_BASE_DIR" ]; then
    echo -e "${RED}❌ No backups directory found${NC}"
    exit 1
  fi
  
  cd "$BACKUP_BASE_DIR"
  BACKUPS=$(ls -t | grep "^${BACKUP_PREFIX}-")
  
  if [ -z "$BACKUPS" ]; then
    echo -e "${YELLOW}⚠️  No backups found for $ENVIRONMENT${NC}"
    exit 1
  fi
  
  echo "Recent backups (newest first):"
  echo ""
  ls -lt | grep "^d" | grep "${BACKUP_PREFIX}-" | head -n 10 | while read -r line; do
    backup_name=$(echo "$line" | awk '{print $NF}')
    timestamp=$(echo "$backup_name" | sed "s/${BACKUP_PREFIX}-//")
    backup_size=$(du -sh "$backup_name" | awk '{print $1}')
    backup_date=$(echo "$line" | awk '{print $6, $7, $8}')
    echo "  📦 $timestamp"
    echo "     Size: $backup_size | Created: $backup_date"
    echo ""
  done
  
  echo "To rollback to a specific backup, run:"
  echo "  $0 $ENVIRONMENT [timestamp]"
  echo ""
  echo "Example:"
  echo "  $0 $ENVIRONMENT $(ls -t | grep "^${BACKUP_PREFIX}-" | head -n 1 | sed "s/${BACKUP_PREFIX}-//")"
  exit 0
fi

BACKUP_DIR="${BACKUP_BASE_DIR}/${BACKUP_PREFIX}-${BACKUP_TIMESTAMP}"

echo "======================================"
echo "  Emergency Rollback - $ENVIRONMENT"
echo "======================================"
echo -e "${RED}⚠️  WARNING: This will replace the current deployment${NC}"
echo ""
echo "Environment: $ENVIRONMENT"
echo "Target: $TARGET_DIR"
echo "Backup: $BACKUP_DIR"
echo "Timestamp: $BACKUP_TIMESTAMP"
echo ""

# Verify backup exists
if [ ! -d "$BACKUP_DIR" ]; then
  echo -e "${RED}❌ Backup not found: $BACKUP_DIR${NC}"
  echo ""
  echo "Run without timestamp to see available backups:"
  echo "  $0 $ENVIRONMENT"
  exit 1
fi

# Verify backup has content
if [ ! -f "$BACKUP_DIR/index.html" ]; then
  echo -e "${RED}❌ Invalid backup - index.html not found${NC}"
  exit 1
fi

# Confirmation prompt
echo -e "${YELLOW}Do you want to proceed with the rollback? (yes/no)${NC}"
read -r CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "Rollback cancelled"
  exit 0
fi

echo ""
echo "Starting rollback process..."

# Create pre-rollback backup
PRE_ROLLBACK_TIMESTAMP=$(date +'%Y-%m-%d-%H-%M-%S')
PRE_ROLLBACK_DIR="${BACKUP_BASE_DIR}/${BACKUP_PREFIX}-pre-rollback-${PRE_ROLLBACK_TIMESTAMP}"

echo "Creating pre-rollback backup..."
if [ -d "$TARGET_DIR" ] && [ "$(ls -A $TARGET_DIR)" ]; then
  if sudo cp -r "$TARGET_DIR" "$PRE_ROLLBACK_DIR"; then
    echo -e "${GREEN}✅ Pre-rollback backup created: ${BACKUP_PREFIX}-pre-rollback-${PRE_ROLLBACK_TIMESTAMP}${NC}"
  else
    echo -e "${YELLOW}⚠️  Pre-rollback backup failed, continuing anyway...${NC}"
  fi
fi

# Clear current deployment
echo "Clearing current deployment..."
if sudo rm -rf "${TARGET_DIR:?}"/*; then
  echo -e "${GREEN}✅ Current deployment cleared${NC}"
else
  echo -e "${RED}❌ Failed to clear current deployment${NC}"
  exit 1
fi

# Restore from backup
echo "Restoring from backup..."
if sudo cp -r "${BACKUP_DIR}"/* "$TARGET_DIR/"; then
  echo -e "${GREEN}✅ Files restored successfully${NC}"
else
  echo -e "${RED}❌ Failed to restore files${NC}"
  exit 1
fi

# Set proper permissions
echo "Setting permissions..."
sudo chown -R $USER:$USER "$TARGET_DIR"
echo -e "${GREEN}✅ Permissions set${NC}"

# Verify restoration
echo "Verifying restoration..."
if [ ! -f "$TARGET_DIR/index.html" ]; then
  echo -e "${RED}❌ Verification failed - index.html not found after restore${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Restoration verified${NC}"

# Reload nginx
echo "Reloading nginx..."
if sudo systemctl reload nginx; then
  echo -e "${GREEN}✅ Nginx reloaded successfully${NC}"
else
  echo -e "${RED}❌ Nginx reload failed${NC}"
  echo "Check nginx logs: sudo tail -f /var/log/nginx/error.log"
  exit 1
fi

# Wait for nginx to stabilize
sleep 3

# Health check
echo ""
echo "Running health check..."
case $ENVIRONMENT in
  staging)
    URL="https://staging.7en.ai"
    ;;
  beta)
    URL="https://beta.7en.ai"
    ;;
  production)
    URL="https://7en.ai"
    ;;
esac

status_code=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
if [ "$status_code" -eq 200 ]; then
  echo -e "${GREEN}✅ Health check passed (Status: $status_code)${NC}"
else
  echo -e "${YELLOW}⚠️  Health check returned status: $status_code${NC}"
  echo "Please verify the site manually: $URL"
fi

# Summary
echo ""
echo "======================================"
echo -e "${GREEN}✅ Rollback completed successfully${NC}"
echo "======================================"
echo ""
echo "Summary:"
echo "  Environment: $ENVIRONMENT"
echo "  Restored backup: $BACKUP_TIMESTAMP"
echo "  Pre-rollback backup: ${BACKUP_PREFIX}-pre-rollback-${PRE_ROLLBACK_TIMESTAMP}"
echo "  Site URL: $URL"
echo ""
echo "Next steps:"
echo "  1. Verify the site is working: $URL"
echo "  2. Check nginx logs if issues persist:"
echo "     sudo tail -f /var/log/nginx/error.log"
echo "  3. If rollback didn't fix the issue, you can restore the pre-rollback backup:"
echo "     $0 $ENVIRONMENT pre-rollback-${PRE_ROLLBACK_TIMESTAMP}"
echo ""
