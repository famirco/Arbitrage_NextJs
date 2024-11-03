/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  assetPrefix: '',
  images: {
    domains: ['amirez.info'],
  },
}

module.exports = nextConfig