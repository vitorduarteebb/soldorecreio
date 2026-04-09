"use strict";

/**
 * Produção na Hostinger/VPS: sobe o Next com `next start` (não standalone).
 * Assim `/_next/static` (CSS/JS) vem sempre de `.next/static` — evita 404 por cópia errada.
 * Carrega .env.production antes do Next (AUTH_SECRET etc.).
 */
require("dotenv").config({ path: ".env.production" });
require("dotenv").config({ path: ".env.production.local", override: true });

if (!process.env.PORT) process.env.PORT = "3000";
if (!process.env.NODE_ENV) process.env.NODE_ENV = "production";

const { spawn } = require("child_process");
const path = require("path");
const nextCli = path.join(__dirname, "node_modules", "next", "dist", "bin", "next");

const child = spawn(
  process.execPath,
  [nextCli, "start", "-p", String(process.env.PORT)],
  { stdio: "inherit", cwd: __dirname, env: process.env },
);

child.on("exit", (code) => process.exit(code ?? 0));
