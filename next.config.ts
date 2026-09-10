import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/site/index.html" },
        { source: "/welcome", destination: "/site/welcome.html" },
        { source: "/welcome.html", destination: "/site/welcome.html" },
        { source: "/index.html", destination: "/site/index.html" },
        { source: "/demo", destination: "/demo/index.html" },
        { source: "/demo/", destination: "/demo/index.html" },
      ],
    };
  },
};

export default nextConfig;
