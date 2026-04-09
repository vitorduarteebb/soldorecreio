/**
 * Garante que o build gerou chunks em .next/static (evita deploy “sem CSS”).
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

const chunks = join(process.cwd(), ".next", "static", "chunks");
const n = countFiles(chunks);

if (n < 5) {
  console.error(
    "[verify-build-static] Esperado .next/static/chunks com vários arquivos; encontrado:",
    n,
  );
  process.exit(1);
}

console.log("[verify-build-static] OK:", n, "arquivos em .next/static/chunks");
