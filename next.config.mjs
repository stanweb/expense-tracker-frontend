/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
    experimental: {
        serverExternalPackages: ["pdf-parse"],
    },


}

export default nextConfig
