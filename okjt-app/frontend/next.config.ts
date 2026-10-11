import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server build for the VPS (deploy-kit: deploy-next.yml),
  // with tracing pinned to this app so server.js lands at .next/standalone/.
  // Skipped on Vercel, whose build adapter sets its own tracing root and
  // fails on this one.
  ...(process.env.VERCEL
    ? {}
    : { output: "standalone" as const, outputFileTracingRoot: path.join(__dirname) }),
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
