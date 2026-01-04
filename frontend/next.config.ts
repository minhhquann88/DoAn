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
      },
      {
        protocol: 'https',
        hostname: '*.onrender.com', // Render backend URLs
        pathname: '/api/files/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/api/files/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8080',
        pathname: '/api/files/**',
      }
    ],
    // Tắt image optimization trong development để tránh lỗi private IP
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
