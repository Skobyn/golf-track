/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable image optimization for static exports
  images: {
    unoptimized: true,
  },
  // Skip type checking on build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint checks during build
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig 