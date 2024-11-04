# Changelog

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
