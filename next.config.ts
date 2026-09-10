import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow /demo/ without Next's default strip-to-/demo (which fought our add-slash redirect).
  skipTrailingSlashRedirect: true,
  async redirects() {
    return [
      // Canonicalize bare /demo to /demo/ so relative assets resolve under /demo/
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
        { source: "/demo/", destination: "/demo/index.html" },
      ],
    };
  },
};

export default nextConfig;
