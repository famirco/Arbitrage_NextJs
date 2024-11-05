/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    outputStandalone: true
  },
  // اضافه کردن basePath
  basePath: '',
  // تنظیم assetPrefix به آدرس نسبی
  assetPrefix: '/',
  // اطمینان از serving فایل‌های استاتیک
  distDir: '.next',
  generateBuildId: async () => {
    return 'build-' + Date.now()
  }
}

module.exports = nextConfig