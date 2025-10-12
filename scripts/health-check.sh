#!/bin/bash

# Health Check Script for 7en.ai Deployments
# Usage: ./scripts/health-check.sh [environment]
# Example: ./scripts/health-check.sh staging

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
TIMEOUT=10
MAX_RETRIES=3

# Determine URL based on environment
case $ENVIRONMENT in
  staging)
    URL="https://staging.7en.ai"
    ;;
  beta)
    URL="https://beta.7en.ai"
    ;;
  production|prod)
    URL="https://7en.ai"
    ;;
  *)
    echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
    echo "Valid options: staging, beta, production"
    exit 1
    ;;
esac

echo "======================================"
echo "  Health Check - $ENVIRONMENT"
echo "======================================"
echo "URL: $URL"
echo "Timeout: ${TIMEOUT}s"
echo "Max retries: $MAX_RETRIES"
echo ""

# Function to check HTTP status
check_http_status() {
  local attempt=1
  
  while [ $attempt -le $MAX_RETRIES ]; do
    echo -e "${YELLOW}⏳ Attempt $attempt of $MAX_RETRIES...${NC}"
    
    # Get status code and response time
    response=$(curl -s -o /dev/null -w "%{http_code}|%{time_total}" --max-time $TIMEOUT "$URL")
    status_code=$(echo "$response" | cut -d'|' -f1)
    response_time=$(echo "$response" | cut -d'|' -f2)
    
    if [ "$status_code" -eq 200 ]; then
      echo -e "${GREEN}✅ HTTP Status: $status_code OK${NC}"
      echo -e "${GREEN}⚡ Response Time: ${response_time}s${NC}"
      return 0
    else
      echo -e "${RED}❌ HTTP Status: $status_code (expected 200)${NC}"
      attempt=$((attempt + 1))
      if [ $attempt -le $MAX_RETRIES ]; then
        echo "   Retrying in 3 seconds..."
        sleep 3
      fi
    fi
  done
  
  return 1
}

# Function to check SSL certificate
check_ssl() {
  echo ""
  echo "Checking SSL certificate..."
  
  ssl_info=$(echo | openssl s_client -servername "${URL#https://}" -connect "${URL#https://}:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SSL Certificate: Valid${NC}"
    echo "$ssl_info" | while read -r line; do
      echo "   $line"
    done
  else
    echo -e "${RED}❌ SSL Certificate: Invalid or expired${NC}"
    return 1
  fi
}

# Function to check if index.html loads
check_index() {
  echo ""
  echo "Checking if index.html loads..."
  
  content=$(curl -s --max-time $TIMEOUT "$URL")
  
  if echo "$content" | grep -q "<html"; then
    echo -e "${GREEN}✅ Index page: Loaded${NC}"
    
    # Check for common elements
    if echo "$content" | grep -q "<title>"; then
      title=$(echo "$content" | grep -o "<title>.*</title>" | sed 's/<[^>]*>//g')
      echo "   Title: $title"
    fi
    
    return 0
  else
    echo -e "${RED}❌ Index page: Failed to load${NC}"
    return 1
  fi
}

# Function to check API connectivity (optional)
check_api() {
  echo ""
  echo "Checking API connectivity..."
  
  case $ENVIRONMENT in
    staging)
      API_URL="https://api-staging.7en.ai/api/health"
      ;;
    beta)
      API_URL="https://api-beta.7en.ai/api/health"
      ;;
    production|prod)
      API_URL="https://api.7en.ai/api/health"
      ;;
  esac
  
  api_status=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$API_URL" 2>/dev/null)
  
  if [ "$api_status" -eq 200 ] || [ "$api_status" -eq 404 ]; then
    # 404 is acceptable if health endpoint doesn't exist
    echo -e "${GREEN}✅ API: Reachable (Status: $api_status)${NC}"
    return 0
  else
    echo -e "${YELLOW}⚠️  API: Status $api_status${NC}"
    return 0  # Don't fail on API check
  fi
}

# Run all checks
echo "Starting health checks..."
echo ""

FAILED=0

if ! check_http_status; then
  FAILED=1
fi

if ! check_ssl; then
  FAILED=1
fi

if ! check_index; then
  FAILED=1
fi

check_api  # Don't fail deployment on API check

# Summary
echo ""
echo "======================================"
if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All health checks passed!${NC}"
  echo "======================================"
  exit 0
else
  echo -e "${RED}❌ Some health checks failed${NC}"
  echo "======================================"
  exit 1
fi
