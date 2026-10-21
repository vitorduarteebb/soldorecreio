/**
 * Variáveis de produção Sol do Recreio (Hostinger).
 */
const au = process.env.AUTH_URL?.trim();
const nu = process.env.NEXTAUTH_URL?.trim();
if (!au && nu) process.env.AUTH_URL = nu;
if (!nu && au) process.env.NEXTAUTH_URL = au;

const siteUrl = "https://skyblue-lark-202006.hostingersite.com";
if (!process.env.AUTH_URL?.trim()) process.env.AUTH_URL = siteUrl;
if (!process.env.NEXTAUTH_URL?.trim()) process.env.NEXTAUTH_URL = siteUrl;

/** Banco do app (sr_*). Dados legados ficam em u494944867_sol.users. */
process.env.DATABASE_USE_COMPONENTS = "true";
process.env.DATABASE_USER = "u494944867_vitorduarteebb";
process.env.DATABASE_PASSWORD = "Blade1411@";
process.env.DATABASE_NAME = "u494944867_horyzonn";
process.env.DATABASE_HOST = "127.0.0.1";
process.env.DATABASE_PORT = "3306";
delete process.env.DATABASE_URL;
delete process.env.DATABASE_PASSWORD_BASE64;
