/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for Railway deployment with Docker
  output: 'standalone',

  // Service Worker headers
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Service-Worker-Allowed',
            value: '/'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          }
        ]
      }
    ];
  },

  // Enable SWC minification for better performance
  swcMinify: true,

  // Experimental features
  experimental: {
    optimizePackageImports: ['lodash-es', 'date-fns']
  }
};

export default nextConfig;
