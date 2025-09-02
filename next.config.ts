import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY,
  },
};

export default nextConfig;
