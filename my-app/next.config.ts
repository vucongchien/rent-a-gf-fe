import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.gravatar.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "mcuoaizrolhegsvdckna.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.moibuocmotduyen.site",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    const imageDomains = [
      "https://i.pinimg.com",
      "https://images.unsplash.com",
      "https://i.pravatar.cc",
      "https://*.gravatar.com",
      "https://*.supabase.co",
      "https://*.moibuocmotduyen.site",
    ].join(" ");

    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; script-src 'self'; connect-src 'self' https: http: data: blob:; img-src 'self' data: blob: https: http:`,
          },
        ],
      },
      {
        // CSP cho toàn bộ app - cho phép load ảnh từ external CDN
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: ${imageDomains}; media-src 'self' https: blob:; connect-src 'self' ${imageDomains}; worker-src 'self' blob:`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
