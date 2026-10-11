import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server build for the VPS (deploy-kit: deploy-next.yml).
  output: "standalone",
  // Pin tracing to this app so server.js lands at .next/standalone/ rather
  // than nested under the monorepo folder name.
  outputFileTracingRoot: path.join(__dirname),
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
      },
      {
        protocol: 'https',
        hostname: 'okjtech.co.ke',
      },
    ],
  },
};

export default nextConfig;
