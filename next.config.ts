import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Produção na Hostinger: use `next start` (ver server.js), não `output: "standalone"`.
   * Standalone + cópia manual de static costuma gerar 404 em /_next/static/chunks/*.css
   */
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
