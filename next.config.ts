import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Force trailing slash so relative demo assets resolve under /demo/
      { source: "/demo", destination: "/demo/", permanent: true },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/site/index.html" },
        { source: "/welcome", destination: "/site/welcome.html" },
        { source: "/welcome.html", destination: "/site/welcome.html" },
        { source: "/index.html", destination: "/site/index.html" },
        // Serve static demo index when URL has trailing slash
        { source: "/demo/", destination: "/demo/index.html" },
      ],
    };
  },
};

export default nextConfig;
