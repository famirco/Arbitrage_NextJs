/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
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