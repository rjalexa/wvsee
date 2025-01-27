import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    WEAVIATE_URL: process.env.WEAVIATE_URL || 'http://localhost:8080'
  }
};

export default nextConfig;
