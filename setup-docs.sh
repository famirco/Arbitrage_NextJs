#!/bin/bash

# رنگ‌ها برای خروجی بهتر
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Creating documentation files...${NC}"

# ایجاد README.md
cat > README.md << 'EOL'
# Arbitrage Bot Project

## Architecture
- Frontend: Next.js (v14)
- Backend: Node.js/Express
- SSL: Cloudflare
- WebSocket: Socket.io for real-time updates

## Infrastructure
### Backend (Port 3001)
- Host: amirez.info
- SSL: Enabled via Cloudflare
- Service: systemd (arbitrage-backend.service)
- Status: Active and running

### Frontend
- Framework: Next.js
- Deployment: PM2
- API Integration: Connects to backend via HTTPS

## Security
### Firewall (UFW) Configuration
- Port 3001: Backend API
- Port 9011: Frontend

## Environment Variables
### Frontend (.env.local)
- NEXT_PUBLIC_API_URL=https://amirez.info:3001

## API Integration Files
- src/utils/api.ts: Base API configuration
- src/hooks/useWebSocket.ts: WebSocket connection setup

## Monitoring
- Backend Service: systemctl status arbitrage-backend
- Logs: journalctl -u arbitrage-backend
- Port Status: netstat -tulpn | grep 3001

## Common Commands
- Check backend status: systemctl status arbitrage-backend
- View logs: journalctl -u arbitrage-backend -n 50
- Check firewall status: sudo ufw status
- Test API connection: curl -v http://localhost:3001/api/settings

## Troubleshooting
1. API Connection Issues:
   - Verify backend service is running
   - Check firewall rules
   - Confirm Cloudflare SSL settings
   - Test local API endpoints
EOL

# ایجاد CHANGELOG.md
cat > CHANGELOG.md << 'EOL'
# Changelog

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
EOL

echo -e "${GREEN}Documentation files created successfully!${NC}"
