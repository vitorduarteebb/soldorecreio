"use strict";

/**
 * Entrada de produção para hospedagens que esperam `server.js` na raiz (ex.: Hostinger).
 * Escuta em todas as interfaces; a porta vem de PORT (painel).
 */
process.env.HOSTNAME = process.env.HOSTNAME || "0.0.0.0";
require("./.next/standalone/server.js");
