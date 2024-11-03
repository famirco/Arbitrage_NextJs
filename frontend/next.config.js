/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  assetPrefix: 'https://amirez.info',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://amirez.info/api/:path*'
      }
    ]
  }
}

module.exports = nextConfig