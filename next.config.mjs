/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  rewrites: async () => [
    {
      source: '/api/:path*',
      destination: `${'https://bisho-backend-2.onrender.com' || 'http://localhost:3000'}/api/:path*`,
    },
  ],
};

export default nextConfig;
