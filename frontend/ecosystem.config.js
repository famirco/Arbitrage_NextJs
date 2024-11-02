module.exports = {
  apps: [{
    name: 'arbitrage-frontend',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    env: {
      PORT: 80,
      NODE_ENV: 'production',
      NEXT_PUBLIC_API_URL: 'https://amirez.info'
    }
  }]
}
