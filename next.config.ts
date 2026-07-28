import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // fabric and pdfjs reference 'canvas' which is browser-only
      canvas: { browser: "./lib/canvas-shim.ts" },
    },
  },
};

export default nextConfig;
