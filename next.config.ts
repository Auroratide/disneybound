import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  images: {
    // Next.js 16+ blocks local IPs by default (SSRF protection). Allowed here because
    // PocketBase intentionally runs on the same machine in both dev and production.
    dangerouslyAllowLocalIP: true,
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
