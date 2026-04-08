import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Inclui `server.js` em `.next/standalone/`; após o build copiamos `.next/static` e `public` para lá. */
  output: "standalone",
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
