import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(root, "..");

function loadEnvFile(relativePath) {
  const filePath = path.join(projectRoot, relativePath);
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

for (const file of [".env", ".env.production", ".env.production.local"]) {
  loadEnvFile(file);
}

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl?.startsWith("mysql://")) {
  process.env.DATABASE_USE_COMPONENTS = "true";
  process.env.DATABASE_USER = "u494944867_vitorduarteebb";
  process.env.DATABASE_PASSWORD = "Blade1411@";
  process.env.DATABASE_NAME = "u494944867_horyzonn";
  process.env.DATABASE_HOST = "localhost";
  process.env.DATABASE_PORT = "3306";
}

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env: process.env,
    cwd: projectRoot,
    shell: process.platform === "win32",
  });
  if ((result.status ?? 1) !== 0) process.exit(result.status ?? 1);
}

run("npx", ["next", "build"]);
run("node", ["scripts/copy-standalone-assets.mjs"]);
run("node", ["scripts/verify-standalone.mjs"]);
