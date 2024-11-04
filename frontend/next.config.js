/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  distDir: '.next',
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://amirez.info' : '',
  experimental: {
    outputStandalone: true
  }
}

module.exports = nextConfig
