import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY,
    PRICE_X: process.env.PRICE_X,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
