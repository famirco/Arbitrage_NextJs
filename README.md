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
