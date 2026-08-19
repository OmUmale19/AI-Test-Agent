import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Use in-memory cache during development on Windows to prevent .pack.gz ENOENT errors
      config.cache = {
        type: 'memory',
      };
    }
    return config;
  },
};

export default nextConfig;

