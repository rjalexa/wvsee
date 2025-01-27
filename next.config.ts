import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  publicRuntimeConfig: {
    weaviateUrl: process.env.WEAVIATE_URL || 'http://localhost:8080'
  }
};

export default nextConfig;
