import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Build reduzido + `server.js` carrega `.next/standalone/server.js` (menos RAM que `next start`). */
  output: "standalone",
  outputFileTracingIncludes: {
    "/*": [
      "./node_modules/.prisma/client/**/*",
      "./node_modules/@prisma/client/**/*",
    ],
  },
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
