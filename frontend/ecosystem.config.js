module.exports = {
  apps: [{
    name: 'arbitrage-frontend',
    script: '.next/standalone/server.js',
    env: {
      PORT: 3000,
      NODE_ENV: 'production',
      NEXT_PUBLIC_API_URL: 'https://amirez.info/api'
    }
  }]
}
