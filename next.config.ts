import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static image imports
  images: {
    unoptimized: true, // For Firebase Hosting compatibility
  },
  // Suppress hydration warnings for RTL
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
