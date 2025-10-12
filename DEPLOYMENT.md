# Deployment Guide

## 📚 Complete Deployment Documentation

For comprehensive CI/CD pipeline documentation, see:

- **[CI/CD Pipeline Guide](./docs/deployment/CI-CD-PIPELINE.md)** - Complete pipeline architecture, workflows, and quality gates
- **[Rollback Procedures](./docs/deployment/ROLLBACK-PROCEDURES.md)** - Automated, manual, and emergency rollback guide
- **[QA Environment Guide](./docs/deployment/QA-ENVIRONMENT.md)** - QA testing workflow and sign-off procedures
- **[Known Issues](./docs/deployment/KNOWN-ISSUES.md)** - Troubleshooting guide and common problems

## Environments

This project supports three deployment environments:

| Environment | URL | API URL |
|------------|-----|---------|
| **Staging** | https://staging.7en.ai | https://api-staging.7en.ai/api/ |
| **Beta** | https://beta.7en.ai | https://api-beta.7en.ai/api/ |
| **Production** | https://7en.ai | https://api.7en.ai/api/ |

## Building for Environments

```bash
# Staging build
npm run build:staging

# Beta build
npm run build:beta

# Production build
npm run build:prod
```

## Automated Deployment via GitHub Actions

### Method 1: Manual Workflow Trigger

1. Go to your GitHub repository
2. Click on the "Actions" tab
3. Select the appropriate workflow:
   - "Deploy to Staging"
   - "Deploy to Beta"
   - "Deploy to Production"
4. Click "Run workflow"
5. Select the branch
6. For production: Type "DEPLOY" in the confirmation field
7. Click "Run workflow"

### Method 2: Tag-based Deployment (Recommended)

**For Staging:**
```bash
git tag staging-1.0.0
git push origin staging-1.0.0
```

**For Beta:**
```bash
git tag beta-1.0.0
git push origin beta-1.0.0
```

**For Production:**
```bash
git tag v1.0.0
git push origin v1.0.0
```

## Required GitHub Secrets

### Staging Environment Secrets
Navigate to: Repository → Settings → Environments → staging

- `STAGING_HOST` - IP address or hostname of staging server
- `STAGING_USER` - SSH username
- `STAGING_SSH_KEY` - Private SSH key (entire key content)
- `STAGING_PORT` - SSH port (optional, defaults to 22)

### Beta Environment Secrets
Navigate to: Repository → Settings → Environments → beta

- `BETA_HOST` - IP address or hostname of beta server
- `BETA_USER` - SSH username
- `BETA_SSH_KEY` - Private SSH key
- `BETA_PORT` - SSH port (optional, defaults to 22)

### Production Environment Secrets
Navigate to: Repository → Settings → Environments → production

- `PROD_HOST` - IP address or hostname of production server
- `PROD_USER` - SSH username
- `PROD_SSH_KEY` - Private SSH key
- `PROD_PORT` - SSH port (optional, defaults to 22)

## Server Setup

### 1. SSH Key Setup

```bash
# On each server, create deployment directories
sudo mkdir -p /var/www/staging.7en.ai
sudo mkdir -p /var/www/beta.7en.ai
sudo mkdir -p /var/www/7en.ai

# Set proper permissions
sudo chown -R $SSH_USER:$SSH_USER /var/www/staging.7en.ai
sudo chown -R $SSH_USER:$SSH_USER /var/www/beta.7en.ai
sudo chown -R $SSH_USER:$SSH_USER /var/www/7en.ai

# Allow SSH user to reload nginx without password
echo "$SSH_USER ALL=(ALL) NOPASSWD: /usr/bin/systemctl reload nginx" | sudo tee /etc/sudoers.d/nginx-reload
```

### 2. Nginx Configuration

**Staging (/etc/nginx/sites-available/staging.7en.ai):**
```nginx
server {
    listen 80;
    server_name staging.7en.ai;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name staging.7en.ai;

    ssl_certificate /etc/letsencrypt/live/staging.7en.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/staging.7en.ai/privkey.pem;

    root /var/www/staging.7en.ai;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Beta (/etc/nginx/sites-available/beta.7en.ai):**
```nginx
server {
    listen 80;
    server_name beta.7en.ai;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name beta.7en.ai;

    ssl_certificate /etc/letsencrypt/live/beta.7en.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/beta.7en.ai/privkey.pem;

    root /var/www/beta.7en.ai;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Production (/etc/nginx/sites-available/7en.ai):**
```nginx
server {
    listen 80;
    server_name 7en.ai www.7en.ai;
    return 301 https://7en.ai$request_uri;
}

server {
    listen 443 ssl http2;
    server_name 7en.ai www.7en.ai;

    ssl_certificate /etc/letsencrypt/live/7en.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/7en.ai/privkey.pem;

    root /var/www/7en.ai;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 3. Enable Sites and SSL

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificates
sudo certbot --nginx -d staging.7en.ai
sudo certbot --nginx -d beta.7en.ai
sudo certbot --nginx -d 7en.ai -d www.7en.ai

# Enable sites
sudo ln -s /etc/nginx/sites-available/staging.7en.ai /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/beta.7en.ai /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/7en.ai /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

## Manual Deployment from Local Machine

```bash
# Build for desired environment
npm run build:staging

# Deploy via rsync
rsync -avz --delete dist/ user@server:/var/www/staging.7en.ai/

# Or via SCP
scp -r dist/* user@server:/var/www/staging.7en.ai/
```

## Troubleshooting

### Deployment Fails with SSH Error
- Verify SSH key is correctly added to GitHub secrets
- Ensure SSH key has no passphrase
- Check server allows key-based authentication
- Verify user has permissions to deployment directory

### Build Fails
- Check environment variables in `.env.*` files
- Verify all dependencies are installed
- Review build logs in GitHub Actions

### Site Not Loading After Deployment
- Verify nginx configuration: `sudo nginx -t`
- Check nginx is running: `sudo systemctl status nginx`
- Verify files are in correct directory: `ls -la /var/www/staging.7en.ai/`
- Check nginx error logs: `sudo tail -f /var/log/nginx/error.log`

### Wrong API URL in Browser
- Clear browser cache
- Check browser console for environment info
- Verify correct build command was used
- Check `.env.*` file for correct environment

## Rollback Procedure

If a deployment causes issues:

```bash
# Via GitHub Actions: Re-run previous successful workflow
# Or manually restore from backup:
ssh user@server
cd /var/www/staging.7en.ai
sudo cp -r /var/www/backups/staging-YYYY-MM-DD/* .
sudo systemctl reload nginx
```

## Monitoring

After deployment, verify:
- [ ] Site loads at correct URL
- [ ] No console errors in browser
- [ ] API calls go to correct environment
- [ ] All features working as expected
- [ ] SSL certificate is valid

## Support

For deployment issues, contact the DevOps team or check the GitHub Actions logs for detailed error messages.
