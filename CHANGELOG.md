# Changelog

## [2024-11-05]
# مستندات پروژه Arbitrage

## معرفی
این پروژه یک سیستم معاملاتی است که از Next.js برای فرانت‌اند و NestJS برای بک‌اند استفاده می‌کند.

## نقش AI (Claude)
- کمک به شناسایی و رفع مشکلات فنی
- ارائه راهکارهای بهینه برای پیاده‌سازی
- تهیه مستندات دقیق و قابل فهم
- پشتیبانی در عیب‌یابی و رفع خطاها

## پیش‌نیازها
- Node.js 18+
- PM2
- Nginx
- Git

## نصب و راه‌اندازی

### 1. حذف سرویس‌های قبلی
\`\`\`bash
sudo systemctl stop arbitrage-frontend
sudo systemctl stop arbitrage-backend
sudo systemctl disable arbitrage-frontend
sudo systemctl disable arbitrage-backend
sudo rm /etc/systemd/system/arbitrage-frontend.service
sudo rm /etc/systemd/system/arbitrage-backend.service
sudo systemctl daemon-reload
\`\`\`

### 2. نصب و کانفیگ Nginx
\`\`\`bash
sudo apt update
sudo apt install nginx
sudo nano /etc/nginx/sites-available/amirez.info
\`\`\`

محتوای فایل کانفیگ:
\`\`\`nginx
server {
    listen 80;
    server_name amirez.info;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Next.js Static Files
    location /_next/static/ {
        alias /root/Arbitrage_NextJs/frontend/.next/static/;
        expires 365d;
        access_log off;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

\`\`\`bash
sudo ln -s /etc/nginx/sites-available/amirez.info /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
\`\`\`

### 3. راه‌اندازی بک‌اند
\`\`\`bash
cd /root/Arbitrage_NextJs/backend
npm install
npm run build
pm2 start dist/index.js --name arbitrage-backend
\`\`\`

### 4. راه‌اندازی فرانت‌اند
\`\`\`bash
cd /root/Arbitrage_NextJs/frontend
npm install
npm run build
pm2 start npm --name arbitrage-frontend -- start
\`\`\`

### 5. تنظیم دسترسی‌ها
\`\`\`bash
sudo chown -R www-data:www-data /root/Arbitrage_NextJs/frontend/.next/
sudo chmod -R 755 /root/Arbitrage_NextJs/frontend/.next/
\`\`\`

## نگهداری

### آپدیت فرانت‌اند
\`\`\`bash
cd /root/Arbitrage_NextJs/frontend
git pull
npm install
npm run build
pm2 restart arbitrage-frontend
sudo chown -R www-data:www-data .next/
\`\`\`

### آپدیت بک‌اند
\`\`\`bash
cd /root/Arbitrage_NextJs/backend
git pull
npm install
npm run build
pm2 restart arbitrage-backend
\`\`\`

## مانیتورینگ

### بررسی وضعیت سرویس‌ها
\`\`\`bash
pm2 status
pm2 logs
\`\`\`

### بررسی لاگ‌های Nginx
\`\`\`bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
\`\`\`


## [2024-11-05]
### Firewall Configuration
- Port 80: HTTP (Next.js frontend)
- Port 3001: Backend API
- Port 9011: SSH
- All ports need both TCP and IPv6 rules

### Required Ports
- 80/tcp: Frontend (Next.js)
- 3001/tcp: Backend API
- 9011/tcp: SSH access

### Changes Made
- Added port 80 to UFW rules for Next.js frontend
- Removed unused Nginx rules (since we're using Next.js directly)


## [2024-11-05]
### System Configuration
- Using Next.js standalone server on port 80
- No Apache/Nginx needed - direct Next.js serving
- Service managed via systemd (arbitrage-frontend.service)

### Current Setup
- Next.js running on port 80
- Cloudflare SSL/TLS set to "Full"
- Static files served directly from Next.js

### Troubleshooting
- Check service status: systemctl status arbitrage-frontend
- Check port 80: lsof -i :80
- Service logs: journalctl -u arbitrage-frontend -n 100

### Known Issues
- 521 Cloudflare error indicates web server unreachable
- Static file loading issues with _next/static paths


## [2024-11-04]
### Changed
- Updated Next.js configuration for static file handling
- Modified frontend service configuration
- Updated build process for better static file management

### Fixed
- Removed conflicting _next folder from public directory
- Updated static file serving configuration
- Modified asset prefix settings in next.config.js

### Current Issues
- Static file loading still failing (404 errors)
- Need to investigate Cloudflare caching and routing
- Frontend build process needs optimization

### Next Steps
- Review Cloudflare page rules
- Investigate static file serving in production
- Consider implementing CDN for static assets


## [2024-11-04]
### Changed
- Updated Next.js configuration to use standalone output
- Modified frontend service to use standalone server
- Updated build and deployment process


## [2024-11-04]
### Added
- Static file handling for frontend build
- Copy .next/static files to public directory

### Changed
- Updated build process to include static file copying


## [2024-11-04]
### Changed
- Cleaned Next.js cache and rebuilt frontend
- Updated API endpoint to use direct IP in .env.local


## [2024-11-04]
### Changed
- Temporarily switched to direct IP connection for API
- Modified Cloudflare SSL settings for troubleshooting


## [2024-11-04]

### Added
- Created api subdomain (api.amirez.info) for backend services

### Changed
- Updated API endpoint in frontend from amirez.info to api.amirez.info
- Updated WebSocket connection to use api subdomain
- Modified environment variables to use new API domain


## [Current]
### Added
- Backend service on port 3001
- Cloudflare SSL integration
- UFW firewall configuration
- WebSocket support for real-time updates
- Frontend API integration with HTTPS

### Changed
- Updated API endpoints to use HTTPS
- Configured WebSocket for secure connections

### Fixed
- API connection issues through proper CORS setup
- SSL certificate handling via Cloudflare

## [1.0.0] - 2024-11-04
- Initial project setup
