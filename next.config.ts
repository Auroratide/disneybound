import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  images: {
    // Next.js 16+ blocks local IPs by default (SSRF protection). Only needed in dev
    // where PocketBase runs on localhost. In production, PocketBase uses a real hostname.
    dangerouslyAllowLocalIP: isDev,
    remotePatterns: [
      {
        // Local Pocketbase instance (development)
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8090",
        pathname: "/api/files/**",
      },
    ],
  },
};

export default nextConfig;
