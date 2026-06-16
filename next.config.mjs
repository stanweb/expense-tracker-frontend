/** @type {import('next').NextConfig} */
// Runtime API base used by Next.js rewrites to proxy same-origin browser
// requests to the backend. In Docker this is the internal network address
// (e.g. http://backend:8080/api); outside Docker it falls back to whatever
// NEXT_PUBLIC_API_BASE_URL points at.
const API_BASE_URL =
  process.env.INTERNAL_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:8080/api';

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
  },
  compiler: {
    removeConsole: {
      exclude: ['error'],
    },
  },
  // Proxy all /api/* calls (except the Next.js route handlers under app/api/ai/*)
  // to the backend. This eliminates CORS for the browser and routes the call
  // over the Docker internal network at request time.
  async rewrites() {
    return [
      {
        source: '/api/:path((?!ai/).*)',
        destination: `${API_BASE_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
