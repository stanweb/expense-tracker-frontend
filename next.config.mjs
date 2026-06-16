/** @type {import('next').NextConfig} */
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
  // Per-request proxying (with auth + cookie forwarding) is handled in
  // middleware.ts instead of static rewrites here.
};

export default nextConfig;
