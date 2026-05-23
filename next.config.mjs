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
    removeConsole:{
      exclude: ['error']
    }
  }


}

export default nextConfig
