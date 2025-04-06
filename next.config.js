/** @type {import('next').NextConfig} */

const nextConfig = {
  // Default port setting
  env: {
    PORT: "3333",
  },
  
  // API proxy - pointing to our backend API server
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3080/api/:path*',
      },
    ];
  },
  
  // Enable React strict mode for better development
  reactStrictMode: true,
  
  // Security improvement - remove X-Powered-By header
  poweredByHeader: false,
  
  // Image optimization
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },

  // Improved development mode settings
  typescript: {
    ignoreBuildErrors: false, // Force TypeScript checks during build
  },
  
  // Next.js 15 specific configurations
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Configure client router cache behavior
    staleTimes: {
      // Don't cache dynamic content by default (Next.js 15 default)
      dynamic: 0,
      // Cache static content for 5 minutes
      static: 300,
    },
  }
};

module.exports = nextConfig;
