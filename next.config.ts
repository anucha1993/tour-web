import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compiler optimizations  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  // Experimental optimizations
  experimental: {
    optimizeCss: true, // Reduce render-blocking CSS
    optimizePackageImports: ['lucide-react', '@heroicons/react'], // Tree-shake icon libraries
  },
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: "https",
        hostname: "pub-6e73c358eb3f4b91990ac2309aa0e232.r2.dev",
      },
      {
        protocol: "https",
        hostname: "booking.checkingroup.co.th",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
  },
};

export default nextConfig;
