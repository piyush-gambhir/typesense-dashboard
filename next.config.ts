import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    TYPESENSE_HOST: 'localhost',
    TYPESENSE_PORT: '8108',
    TYPESENSE_PROTOCOL: 'http',
    TYPESENSE_API_KEY: 'xyz',
  },
};

export default nextConfig;
