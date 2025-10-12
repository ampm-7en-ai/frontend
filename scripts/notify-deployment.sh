#!/bin/bash

# Deployment Notification Script for 7en.ai
# Usage: ./scripts/notify-deployment.sh [environment] [status] [details]
# Example: ./scripts/notify-deployment.sh staging success "Deployed v1.2.3"

set -e

# Configuration
ENVIRONMENT=${1}
STATUS=${2}
DETAILS=${3:-"No details provided"}
TIMESTAMP=$(date +'%Y-%m-%d %H:%M:%S UTC')

# Validate arguments
if [ -z "$ENVIRONMENT" ] || [ -z "$STATUS" ]; then
  echo "Usage: $0 [environment] [status] [details]"
  echo "Example: $0 staging success 'Deployed v1.2.3'"
  exit 1
fi

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
    echo "Invalid environment: $ENVIRONMENT"
    exit 1
    ;;
esac

# Determine emoji and color based on status
case $STATUS in
  success)
    EMOJI="✅"
    COLOR="good"  # Green for Slack
    ;;
  failure|failed)
    EMOJI="❌"
    COLOR="danger"  # Red for Slack
    ;;
  warning)
    EMOJI="⚠️"
    COLOR="warning"  # Yellow for Slack
    ;;
  started|deploying)
    EMOJI="🚀"
    COLOR="#439FE0"  # Blue for Slack
    ;;
  rollback)
    EMOJI="🔄"
    COLOR="warning"
    ;;
  *)
    EMOJI="ℹ️"
    COLOR="#439FE0"
    ;;
esac

# Console output
echo "======================================"
echo "  Deployment Notification"
echo "======================================"
echo "Environment: $ENVIRONMENT"
echo "Status: $STATUS"
echo "Details: $DETAILS"
echo "URL: $URL"
echo "Timestamp: $TIMESTAMP"
echo ""

# Slack notification (if webhook URL is configured)
if [ -n "$SLACK_WEBHOOK_URL" ]; then
  echo "Sending Slack notification..."
  
  SLACK_MESSAGE=$(cat <<EOF
{
  "attachments": [
    {
      "color": "$COLOR",
      "title": "$EMOJI Deployment $STATUS - $ENVIRONMENT",
      "text": "$DETAILS",
      "fields": [
        {
          "title": "Environment",
          "value": "$ENVIRONMENT",
          "short": true
        },
        {
          "title": "Status",
          "value": "$STATUS",
          "short": true
        },
        {
          "title": "URL",
          "value": "$URL",
          "short": false
        },
        {
          "title": "Timestamp",
          "value": "$TIMESTAMP",
          "short": true
        },
        {
          "title": "Deployed by",
          "value": "${GITHUB_ACTOR:-Unknown}",
          "short": true
        }
      ],
      "footer": "7en.ai Deployment System",
      "footer_icon": "https://7en.ai/logo-icon-new.svg",
      "ts": $(date +%s)
    }
  ]
}
EOF
)
  
  if curl -X POST -H 'Content-type: application/json' \
    --data "$SLACK_MESSAGE" \
    "$SLACK_WEBHOOK_URL" > /dev/null 2>&1; then
    echo "✅ Slack notification sent"
  else
    echo "⚠️  Failed to send Slack notification"
  fi
else
  echo "ℹ️  SLACK_WEBHOOK_URL not configured, skipping Slack notification"
fi

# Email notification (if configured)
if [ -n "$NOTIFICATION_EMAIL" ]; then
  echo "Sending email notification..."
  
  EMAIL_SUBJECT="[7en.ai] Deployment $STATUS - $ENVIRONMENT"
  EMAIL_BODY="Deployment Notification

Environment: $ENVIRONMENT
Status: $STATUS
Details: $DETAILS
URL: $URL
Timestamp: $TIMESTAMP
Deployed by: ${GITHUB_ACTOR:-Unknown}

This is an automated notification from the 7en.ai deployment system."
  
  if command -v mail &> /dev/null; then
    echo "$EMAIL_BODY" | mail -s "$EMAIL_SUBJECT" "$NOTIFICATION_EMAIL"
    echo "✅ Email notification sent to $NOTIFICATION_EMAIL"
  else
    echo "⚠️  'mail' command not found, skipping email notification"
  fi
else
  echo "ℹ️  NOTIFICATION_EMAIL not configured, skipping email notification"
fi

# Discord notification (if webhook URL is configured)
if [ -n "$DISCORD_WEBHOOK_URL" ]; then
  echo "Sending Discord notification..."
  
  DISCORD_MESSAGE=$(cat <<EOF
{
  "embeds": [{
    "title": "$EMOJI Deployment $STATUS",
    "description": "$DETAILS",
    "color": $(case $STATUS in success) echo "3066993";; failure|failed) echo "15158332";; warning) echo "15105570";; *) echo "3447003";; esac),
    "fields": [
      {
        "name": "Environment",
        "value": "$ENVIRONMENT",
        "inline": true
      },
      {
        "name": "Status",
        "value": "$STATUS",
        "inline": true
      },
      {
        "name": "URL",
        "value": "$URL"
      },
      {
        "name": "Deployed by",
        "value": "${GITHUB_ACTOR:-Unknown}",
        "inline": true
      },
      {
        "name": "Timestamp",
        "value": "$TIMESTAMP",
        "inline": true
      }
    ],
    "footer": {
      "text": "7en.ai Deployment System"
    },
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  }]
}
EOF
)
  
  if curl -X POST -H 'Content-type: application/json' \
    --data "$DISCORD_MESSAGE" \
    "$DISCORD_WEBHOOK_URL" > /dev/null 2>&1; then
    echo "✅ Discord notification sent"
  else
    echo "⚠️  Failed to send Discord notification"
  fi
else
  echo "ℹ️  DISCORD_WEBHOOK_URL not configured, skipping Discord notification"
fi

# GitHub commit status (if running in GitHub Actions)
if [ -n "$GITHUB_REPOSITORY" ] && [ -n "$GITHUB_SHA" ] && [ -n "$GITHUB_TOKEN" ]; then
  echo "Updating GitHub commit status..."
  
  case $STATUS in
    success)
      GH_STATE="success"
      ;;
    failure|failed)
      GH_STATE="failure"
      ;;
    started|deploying)
      GH_STATE="pending"
      ;;
    *)
      GH_STATE="success"
      ;;
  esac
  
  GITHUB_API_URL="https://api.github.com/repos/$GITHUB_REPOSITORY/statuses/$GITHUB_SHA"
  
  curl -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "$GITHUB_API_URL" \
    -d "{
      \"state\": \"$GH_STATE\",
      \"target_url\": \"$URL\",
      \"description\": \"$DETAILS\",
      \"context\": \"deployment/$ENVIRONMENT\"
    }" > /dev/null 2>&1
  
  echo "✅ GitHub commit status updated"
else
  echo "ℹ️  Not running in GitHub Actions, skipping commit status update"
fi

echo ""
echo "======================================"
echo "✅ Notifications complete"
echo "======================================"
