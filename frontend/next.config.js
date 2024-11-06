/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
      outputFileTracingRoot: process.cwd(),  // اضافه کردن مسیر صحیح
  }
}

module.exports = nextConfig