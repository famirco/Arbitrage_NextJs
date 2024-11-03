module.exports = {
  apps: [{
    name: 'arbitrage-frontend',
    cwd: '/var/www/arbitrage',
    script: 'server.js',
    env: {
      PORT: 3000,
      NODE_ENV: 'production',
      HOSTNAME: '0.0.0.0'
    }
  }]
}