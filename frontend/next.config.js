/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    outputStandalone: true
  },
  assetPrefix: 'https://amirez.info',
  images: {
    domains: ['amirez.info'],
  }
}

module.exports = nextConfig