import type { NextConfig } from "next";

const nextConfig = {
  eslint: {
    // Ignore ESLint errors during production builds
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
