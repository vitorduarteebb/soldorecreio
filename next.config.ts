import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Inclui `server.js` em `.next/standalone/`; após o build copiamos `.next/static` e `public` para lá. */
  output: "standalone",
  /**
   * Garante que o cliente Prisma e o engine binário entrem no trace do standalone
   * (evita falhas silenciosas ou erros de engine em produção na Hostinger).
   */
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
