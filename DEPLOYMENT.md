# CI/CD Deployment Guide

This project uses GitHub Actions for automated deployment to Hostinger and building Android APKs.

## Setup GitHub Secrets

Before pushing to GitHub, add these secrets in your repository settings:
**Settings → Secrets and variables → Actions → New repository secret**

### Required Secrets:

1. **SSH_HOST**: `46.202.186.219`
2. **SSH_USERNAME**: `u314333613`
3. **SSH_PASSWORD**: `your_ssh_password`
4. **SSH_PORT**: `65002`

## Workflows

### 1. **Deploy to Production** (`.github/workflows/deploy-production.yml`)
- **Triggers**: Push to `master` branch or manual dispatch
- **Actions**: 
  - Pulls latest code from GitHub to Hostinger
  - Installs Composer dependencies
  - Runs migrations
  - Clears and caches Laravel config
  - Sets proper permissions

### 2. **Build Android APK** (`.github/workflows/build-apk.yml`)
- **Triggers**: Push to `master` (when JS/Android files change) or manual dispatch
- **Actions**:
  - Builds production frontend assets
  - Compiles Android APK
  - Renames to `tacats.apk`
  - Uploads APK as artifact (available for 30 days)

### 3. **Run Tests** (`.github/workflows/tests.yml`)
- **Triggers**: Pull requests and pushes to `master`
- **Actions**: Runs PHP tests with MySQL

## Development Workflow

### Local Development:
```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push origin master
```

### After Push:
1. GitHub Actions automatically:
   - Runs tests
   - Deploys to Hostinger (if tests pass)
   - Builds new APK (if relevant files changed)

2. Download APK:
   - Go to **Actions** tab in GitHub
   - Click on the workflow run
   - Download `tacats-apk` from Artifacts

### Manual Deployment (SSH):
```bash
ssh -p 65002 u314333613@46.202.186.219
cd /home/u314333613/domains/tacats.live/tacats/lanao-delnorte_parking-ticketing
git pull origin master
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan migrate --force
```

## URLs
- **Website**: https://tacats.live
- **Admin Panel**: https://tacats.live/admin
- **GitHub Repo**: https://github.com/LeeDev428/lanao-delnorte_parking-ticketing

## Notes
- `.env` is not tracked in Git (keep production `.env` only on server)
- APK connects to `https://tacats.live` (production)
- For local dev, use `npm run dev` and Laravel serves on port 8000
