import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.igdb.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  // En-têtes de sécurité basiques
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { 
            key: 'X-Frame-Options', 
            value: 'DENY' 
          },
          { 
            key: 'X-Content-Type-Options', 
            value: 'nosniff' 
          },
          { 
            key: 'X-DNS-Prefetch-Control', 
            value: 'false' 
          },
          { 
            key: 'Referrer-Policy', 
            value: 'strict-origin-when-cross-origin' 
          },
          // CSP optimisée pour Radix UI + Tailwind CSS + Next.js
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "img-src 'self' https://images.igdb.com data: blob:",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' data:",
              "font-src 'self' data:",
              "connect-src 'self'",
              "object-src 'none'",
              "base-uri 'self'"
            ].join('; '),
          },
        ],
      },
    ];
  },
  
  // Configuration additionnelle légère
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;