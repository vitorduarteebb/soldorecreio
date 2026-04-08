/**
 * Ajustes de ambiente antes do Auth.js carregar (Hostinger / painéis que usam NEXTAUTH_URL).
 * Importe este módulo no topo de `auth.ts`.
 */
const au = process.env.AUTH_URL?.trim();
const nu = process.env.NEXTAUTH_URL?.trim();
if (!au && nu) {
  process.env.AUTH_URL = nu;
}
