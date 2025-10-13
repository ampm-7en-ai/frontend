# Rollback Procedures

There are two supported rollback paths:

1) GitHub Workflow (recommended)
- Use .github/workflows/rollback.yml (Workflow Dispatch)
- Choose environment (staging, beta, production)
- Optionally pass a backup_timestamp to restore
- The workflow:
  - Creates a pre-rollback backup
  - Restores from /var/www/backups/<env>-<timestamp>
  - Reloads nginx
  - Performs a health check

2) SSH + Script (manual)
- SSH into the target host
- List backups: ls -lth /var/www/backups
- Run the script:
  - ./scripts/emergency-rollback.sh <environment> <timestamp>
- Example:
  - ./scripts/emergency-rollback.sh production 2025-01-15-18-10-33

Backup retention:
- create-backup.sh keeps last 10 per environment by default.

Verification:
- After rollback, verify URL:
  - curl -I https://staging.7en.ai
  - curl -I https://beta.7en.ai
  - curl -I https://7en.ai
