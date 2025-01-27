import type { NextConfig } from "next";

if (!process.env.WEAVIATE_URL) {
  throw new Error('WEAVIATE_URL environment variable is required');
}

console.log('Next.js config - Using Weaviate URL:', process.env.WEAVIATE_URL);

const nextConfig: NextConfig = {
  output: 'standalone',
  serverRuntimeConfig: {
    weaviateUrl: process.env.WEAVIATE_URL
  },
  publicRuntimeConfig: {
    weaviateUrl: process.env.WEAVIATE_URL
  }
};

export default nextConfig;
