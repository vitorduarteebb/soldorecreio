"use strict";

/**
 * Entrada de produção para hospedagens que esperam `server.js` na raiz (ex.: Hostinger).
 * Escuta em todas as interfaces; a porta vem de PORT (painel).
 */
process.env.HOSTNAME = process.env.HOSTNAME || "0.0.0.0";
if (!process.env.PORT) process.env.PORT = "3000";
if (!process.env.NODE_ENV) process.env.NODE_ENV = "production";
require("./.next/standalone/server.js");
