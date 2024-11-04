/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
<<<<<<< HEAD
  distDir: '.next',
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://amirez.info' : '',
  experimental: {
    outputStandalone: true
  }
=======
  assetPrefix: '',
  images: {
    domains: ['amirez.info'],
  },
>>>>>>> 9d95b706adc71cad6cc9752fced3cacf17248525
}

module.exports = nextConfig
