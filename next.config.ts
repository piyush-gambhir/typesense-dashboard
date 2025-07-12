import type { NextConfig } from 'next';

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
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        TYPESENSE_HOST: process.env.TYPESENSE_HOST,
        TYPESENSE_PORT: process.env.TYPESENSE_PORT,
        TYPESENSE_PROTOCOL: process.env.TYPESENSE_PROTOCOL,
        TYPESENSE_API_KEY: process.env.TYPESENSE_API_KEY,
    },
};

export default nextConfig;
