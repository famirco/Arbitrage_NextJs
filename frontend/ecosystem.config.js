module.exports = {
  apps: [{
    name: 'arbitrage-frontend',
    cwd: '/root/Arbitrage_NextJs/frontend',
    script: '.next/standalone/server.js',
    env: {
      PORT: 3000,
      NODE_ENV: 'production',
      HOSTNAME: '0.0.0.0'
    }
  }]
}