import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    serverExternalPackages: ['pdf-parse'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ui-avatars.com',
                pathname: '/api/**',
            },
        ],
    },
    turbopack: {
        root: '.',
    },
};

export default nextConfig;
