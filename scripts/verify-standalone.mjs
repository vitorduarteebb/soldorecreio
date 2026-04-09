/**
 * Falha o build se o standalone não tiver CSS/JS copiados (evita 404 em /_next/static).
 */
import { existsSync, readdirSync, statSync } from "fs";
import { join } from "path";

function countFiles(dir) {
  if (!existsSync(dir)) return 0;
  let n = 0;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) n += countFiles(p);
    else n += 1;
  }
  return n;
}

const root = process.cwd();
const staticDir = join(root, ".next", "standalone", ".next", "static");
const n = countFiles(staticDir);

if (n < 10) {
  console.error(
    "[verify-standalone] Esperado .next/standalone/.next/static com dezenas de arquivos; encontrado:",
    n,
    "— rode `npm run build` completo (next build + copy-standalone).",
  );
  process.exit(1);
}

console.log("[verify-standalone] OK:", n, "arquivos em standalone/.next/static");
