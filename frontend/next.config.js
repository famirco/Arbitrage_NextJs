/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    outputStandalone: true,
  },
  // تنظیم پورت برای اجرا روی 80
  server: {
    port: 80
  }
}

module.exports = nextConfig