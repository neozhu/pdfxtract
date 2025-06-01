import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    domains: ['localhost'],
    // Allow data URLs and local images to be displayed unoptimized
    unoptimized: true,
  },
  // Ensure that Next.js serves the pdf-outputs directory as static files
  // even if they are generated at runtime
  outputFileTracing: true,
  output: 'standalone',
};

export default nextConfig;
