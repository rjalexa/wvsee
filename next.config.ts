import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    WEAVIATE_URL: process.env.WEAVIATE_URL
  }
};

console.log('Next.js config - Using Weaviate URL:', process.env.WEAVIATE_URL);

export default nextConfig;
