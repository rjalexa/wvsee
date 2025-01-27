import type { NextConfig } from "next";

const weaviateUrl = process.env.WEAVIATE_URL || 'http://localhost:8080';
console.log('Next.js config - Using Weaviate URL:', weaviateUrl);

const nextConfig: NextConfig = {
  output: 'standalone',
  serverRuntimeConfig: {
    weaviateUrl
  },
  publicRuntimeConfig: {
    weaviateUrl
  }
};

export default nextConfig;
