"use strict";

/**
 * Hostinger: muitas vezes o painel chama `node server.js` (não `npm start`), por isso
 * copiamos sempre `.next/static` → standalone **antes** de subir o servidor.
 */
const path = require("path");
const { execFileSync } = require("child_process");

require("dotenv").config({ path: ".env.production" });
require("dotenv").config({ path: ".env.production.local", override: true });

if (!process.env.PORT) process.env.PORT = "3000";
if (!process.env.NODE_ENV) process.env.NODE_ENV = "production";
process.env.HOSTNAME = process.env.HOSTNAME || "0.0.0.0";

const root = __dirname;
const copyScript = path.join(root, "scripts", "copy-standalone-assets.mjs");
try {
  execFileSync(process.execPath, [copyScript], {
    stdio: "inherit",
    cwd: root,
    env: process.env,
  });
} catch {
  console.error(
    "[server] Falha ao copiar assets para standalone. Rode na pasta do app: npm install && npm run build",
  );
  process.exit(1);
}

require("./.next/standalone/server.js");
