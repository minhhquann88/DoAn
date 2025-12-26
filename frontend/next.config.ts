import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'files.f8.edu.vn',
      },
      {
        protocol: 'https',
        hostname: 'files.fullstack.edu.vn', // Dự phòng
      }
    ],
  },
};

export default nextConfig;
