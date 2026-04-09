/**
 * Next.js standalone não inclui `.next/static` nem `public` no trace.
 * Sem esta cópia, CSS/JS retornam 404/503 em hospedagens.
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/output
 */
import { cpSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const root = process.cwd();
const standalone = join(root, ".next", "standalone");
const staticSrc = join(root, ".next", "static");
const publicSrc = join(root, "public");

if (!existsSync(standalone)) {
  console.error(
    "[copy-standalone] .next/standalone não encontrado. Rode `npm run build` com output: 'standalone'.",
  );
  process.exit(1);
}
if (!existsSync(staticSrc)) {
  console.error("[copy-standalone] .next/static não encontrado após o build.");
  process.exit(1);
}

const destNext = join(standalone, ".next");
mkdirSync(destNext, { recursive: true });
cpSync(staticSrc, join(destNext, "static"), { recursive: true, force: true });

if (existsSync(publicSrc)) {
  cpSync(publicSrc, join(standalone, "public"), { recursive: true, force: true });
}

console.log("[copy-standalone] OK: .next/static e public/ copiados para standalone.");
