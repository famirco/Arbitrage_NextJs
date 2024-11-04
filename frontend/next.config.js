/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    experimental: {
      outputStandalone: true
    },
    // اضافه کردن basePath و assetPrefix
    basePath: '',
    assetPrefix: ''
  }
  
  module.exports = nextConfig