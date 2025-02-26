import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['localhost'],
  },
};

export default nextConfig;
