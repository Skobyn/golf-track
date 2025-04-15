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
  // Configure static export
  output: 'export',
  // Configure trailing slashes for static exports
  trailingSlash: true,
  // Configure distDir for Vercel
  distDir: 'out',
}

module.exports = nextConfig 