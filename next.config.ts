import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy API requests to Laravel backend (avoids CORS)
  async rewrites() {
    const apiTarget = process.env.API_PROXY_TARGET || 'http://127.0.0.1:8000/api';
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: `${apiTarget}/:path*`,
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  // 301/308 redirects from the previous website's URL scheme so old Google
  // results and inbound links land on current pages instead of 404ing.
  // NOTE: Order matters — more specific patterns must come before catch-alls.
  async redirects() {
    return [
      // Old per-country landing pages: /oversea/china -> /tours/country/china
      // (align with new canonical listing under /tours/country/{slug})
      { source: '/oversea/:slug', destination: '/tours/country/:slug', permanent: true },
      { source: '/oversea', destination: '/tours/international', permanent: true },

      // Old international-tours listing (root + any child path)
      { source: '/intertours', destination: '/tours/international', permanent: true },
      { source: '/intertours/:path*', destination: '/tours/international', permanent: true },

      // Old tour detail used a numeric id with no slug map. Per SEO spec,
      // land on the blog (informational) instead of the international listing.
      { source: '/around-detail/:id*', destination: '/blog', permanent: true },

      // Old reviews pages: /clients-review/0/0 -> /reviews
      { source: '/clients-review/:path*', destination: '/reviews', permanent: true },

      // Old promotions page from the PHP site
      { source: '/promotion.php', destination: '/promotions', permanent: true },

      // Legacy PHP front controller: /index.php[/anything] -> homepage
      { source: '/index.php', destination: '/', permanent: true },
      { source: '/index.php/:path*', destination: '/', permanent: true },
    ];
  },
  // Security headers applied to every response.
  // NOTE: A strict Content-Security-Policy is intentionally omitted here because
  // it needs careful testing against GA4 / Meta Pixel / inline styles. Add it
  // once analytics IDs are finalized.
  async headers() {
    return [
      // Long-cache immutable static assets (JS, CSS, images from Next build)
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Long-cache the optimized image proxy responses
      {
        source: '/_next/image',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, s-maxage=31536000, stale-while-revalidate=86400' },
        ],
      },
      // Fonts + favicons
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico|woff|woff2|ttf)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
          },
        ],
      },
    ];
  },
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
    // Allow a lower quality for the LCP hero image (it sits under a dark
    // gradient overlay, so the reduction is imperceptible but cuts bytes ~20%).
    qualities: [65, 75],
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
        hostname: "pub-5cbbaf6280f04ca487a930d56cd23307.r2.dev",
      },
      {
        protocol: "https",
        hostname: "files.nexttrip.world",
      },
      {
        protocol: "https",
        hostname: "booking.checkingroup.co.th",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "www.zegotravel.com",
      },
      {
        protocol: "https",
        hostname: "godlikecenter.com",
      },
      {
        protocol: "http",
        hostname: "www.qualityb2bpackage.com",
      },
    ],
  },
};

export default nextConfig;
