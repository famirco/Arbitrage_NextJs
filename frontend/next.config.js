/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: process.cwd()  // جابجایی از experimental به root
}

module.exports = nextConfig