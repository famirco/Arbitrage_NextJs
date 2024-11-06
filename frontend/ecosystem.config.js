module.exports = {
  apps: [{
    name: 'arbitrage-frontend',
    cwd: '/root/Arbitrage_NextJs/frontend',
    script: 'npm',
    args: 'start',
    env: {
      PORT: 3000,
      NODE_ENV: 'production',
      HOSTNAME: '0.0.0.0'
    }
  }]
}