import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.georgiaholiday.com",

        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "127.0.0.1",

        port: "9001",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",

        port: "9001",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
