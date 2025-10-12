#!/bin/bash

# Backup Creation Script for 7en.ai Deployments
# Usage: ./scripts/create-backup.sh [environment]
# Example: ./scripts/create-backup.sh staging

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
BACKUP_BASE_DIR="/var/www/backups"
TIMESTAMP=$(date +'%Y-%m-%d-%H-%M-%S')

# Determine source directory based on environment
case $ENVIRONMENT in
  staging)
    SOURCE_DIR="/var/www/staging.7en.ai"
    BACKUP_NAME="staging-${TIMESTAMP}"
    ;;
  beta)
    SOURCE_DIR="/var/www/beta.7en.ai"
    BACKUP_NAME="beta-${TIMESTAMP}"
    ;;
  production|prod)
    SOURCE_DIR="/var/www/7en.ai"
    BACKUP_NAME="production-${TIMESTAMP}"
    ENVIRONMENT="production"
    ;;
  *)
    echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
    echo "Valid options: staging, beta, production"
    exit 1
    ;;
esac

BACKUP_DIR="${BACKUP_BASE_DIR}/${BACKUP_NAME}"

echo "======================================"
echo "  Backup Creation - $ENVIRONMENT"
echo "======================================"
echo "Source: $SOURCE_DIR"
echo "Backup: $BACKUP_DIR"
echo "Timestamp: $TIMESTAMP"
echo ""

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
  echo -e "${RED}❌ Source directory not found: $SOURCE_DIR${NC}"
  exit 1
fi

# Check if source directory has content
if [ ! "$(ls -A $SOURCE_DIR)" ]; then
  echo -e "${YELLOW}⚠️  Source directory is empty, skipping backup${NC}"
  exit 0
fi

# Create backup base directory if it doesn't exist
echo "Creating backup directory..."
sudo mkdir -p "$BACKUP_BASE_DIR"

# Create backup
echo "Copying files..."
if sudo cp -r "$SOURCE_DIR" "$BACKUP_DIR"; then
  echo -e "${GREEN}✅ Backup created successfully${NC}"
else
  echo -e "${RED}❌ Backup creation failed${NC}"
  exit 1
fi

# Calculate backup size
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | awk '{print $1}')
echo "Backup size: $BACKUP_SIZE"

# Count files in backup
FILE_COUNT=$(find "$BACKUP_DIR" -type f | wc -l)
echo "Files backed up: $FILE_COUNT"

# Clean up old backups (keep last 10)
echo ""
echo "Cleaning up old backups..."

cd "$BACKUP_BASE_DIR"
OLD_BACKUPS=$(ls -t | grep "^${ENVIRONMENT}-" | tail -n +11)

if [ -n "$OLD_BACKUPS" ]; then
  echo "Removing old backups:"
  echo "$OLD_BACKUPS" | while read -r backup; do
    echo "  - $backup"
    sudo rm -rf "$backup"
  done
  echo -e "${GREEN}✅ Old backups removed${NC}"
else
  echo "No old backups to remove"
fi

# List remaining backups
echo ""
echo "Current backups for $ENVIRONMENT:"
ls -lth "$BACKUP_BASE_DIR" | grep "^d" | grep "^${ENVIRONMENT}-" | head -n 10 | while read -r line; do
  backup_name=$(echo "$line" | awk '{print $NF}')
  backup_size=$(du -sh "$BACKUP_BASE_DIR/$backup_name" | awk '{print $1}')
  echo "  - $backup_name ($backup_size)"
done

echo ""
echo "======================================"
echo -e "${GREEN}✅ Backup completed successfully${NC}"
echo "======================================"
echo "Backup location: $BACKUP_DIR"
echo ""
echo "To restore this backup, run:"
echo "  ./scripts/emergency-rollback.sh $ENVIRONMENT $TIMESTAMP"
