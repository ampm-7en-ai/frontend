# Known Issues & Tips

Permissions on server
- If deployment fails to write, ensure SSH_USER owns target directories or has group write access.
- Consider deploying to /tmp/deploy_<env> then sudo rsync → target.

SSH key format
- Store a valid private key in GitHub secret SSH_KEY (no passphrase).
- Public key must be on the server's authorized_keys for SSH_USER.

Missing tools on server
- scp/rsync/curl should be installed. If curl is missing, health step may fail.
- nginx reload is not part of deploy; add a step if you need it.

Build artifacts
- Vite outputs dist/. Workflows upload dist/* into the web root.
- If you see nested dist folders, clear target and redeploy, or set scp to source: dist/*.

Environment URLs
- Health checks use:
  - staging → https://staging.7en.ai
  - beta    → https://beta.7en.ai
  - prod    → https://7en.ai
- Adjust if your domains differ.

Rollback expectations
- Backups live in /var/www/backups/<env>-<timestamp>.
- Rollback workflow and scripts require those backups to exist.
