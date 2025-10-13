# CI/CD Pipeline

This repository ships three deployment workflows:
- .github/workflows/deploy-staging.yml
- .github/workflows/deploy-beta.yml
- .github/workflows/deploy-production.yml

Triggers:
- Staging: push to branch "staging" or manual dispatch
- Beta: push to branch "beta" or manual dispatch
- Production: push to "production" or "main", or manual dispatch

What they do:
1) Checkout code
2) Setup Node 18, install deps, build Vite app (outputs dist/)
3) Best-effort remote backup of current release into /var/www/backups
4) Upload dist/* to the target web root
5) Health check (script if present, else curl)
6) Optional notifications (if notify-deployment.sh is present)

Required GitHub Secrets:
- SSH_USER: SSH username with write access to target dirs
- SSH_KEY: Private key for SSH_USER (PEM/OpenSSH format)
- STAGING_HOST, BETA_HOST, PRODUCTION_HOST: Remote hosts

Default target directories and URLs:
- Staging: /var/www/staging.7en.ai  → https://staging.7en.ai
- Beta:    /var/www/beta.7en.ai     → https://beta.7en.ai
- Prod:    /var/www/7en.ai          → https://7en.ai

Permissions and ownership:
- Ensure SSH_USER can write to target directories (own the dir or grant proper group perms).
- If root-owned, consider deploying to /tmp then rsync via sudo in an SSH step.

Build command:
- npm ci && npm run build (Vite outputs dist/)

Related:
- Rollback workflow: .github/workflows/rollback.yml
- Health/backup/notify scripts under scripts/
