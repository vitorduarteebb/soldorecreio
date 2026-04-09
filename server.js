"use strict";

/**
 * Entrada de produção para hospedagens que esperam `server.js` na raiz (ex.: Hostinger).
 * Carrega `.env.production` / `.env.production.local` ANTES do Next — muitos painéis não
 * injetam AUTH_SECRET no processo Node; sem isso /api/auth/session retorna 500 (Auth.js).
 */
require("dotenv").config({ path: ".env.production" });
require("dotenv").config({ path: ".env.production.local", override: true });

/**
 * Escuta em todas as interfaces; a porta vem de PORT (painel).
 */
process.env.HOSTNAME = process.env.HOSTNAME || "0.0.0.0";
if (!process.env.PORT) process.env.PORT = "3000";
if (!process.env.NODE_ENV) process.env.NODE_ENV = "production";
require("./.next/standalone/server.js");
