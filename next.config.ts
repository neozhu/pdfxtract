import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    domains: ['localhost'],
    // Allow data URLs and local images to be displayed unoptimized
    unoptimized: true,
  }
};

export default nextConfig;
