import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: ['pdf-parse'],
    output: 'standalone',
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },
    experimental: {
        cpus: 1,
        workerThreads: false
    }
};



export default nextConfig;
