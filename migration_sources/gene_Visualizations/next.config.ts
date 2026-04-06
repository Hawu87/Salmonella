import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack config (Next.js 16 default) - empty config to silence warning
  turbopack: {},
  // Webpack config for plotly.js compatibility
  webpack: (config, { isServer }) => {
    // Fix for plotly.js - exclude fs in client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;
