// next.config.js

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'iguov8nhvyobj.vcdn.cloud',
            },
            {
                protocol: 'https',
                hostname: 'm.media-amazon.com',
            },
            {
                protocol: 'https',
                hostname: 'image.tmdb.org',
            },
        ],
    },
};

export default nextConfig;