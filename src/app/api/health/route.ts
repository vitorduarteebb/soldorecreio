import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Diagnóstico rápido no deploy (não expõe segredos).
 * Abra GET /api/health no navegador e confira o que falta.
 * `DATABASE_REACHABLE` só é testado se `DATABASE_URL` estiver definida.
 */
export async function GET() {
  const authSecret =
    Boolean(process.env.AUTH_SECRET?.trim()) ||
    Boolean(process.env.NEXTAUTH_SECRET?.trim());
  const authUrl =
    Boolean(process.env.AUTH_URL?.trim()) ||
    Boolean(process.env.NEXTAUTH_URL?.trim());
  const databaseUrl = Boolean(process.env.DATABASE_URL?.trim());
  const nodeEnv = process.env.NODE_ENV ?? "(não definido)";

  let databaseReachable: boolean | null = null;
  if (databaseUrl) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      databaseReachable = true;
    } catch {
      databaseReachable = false;
    }
  }

  const ok =
    authSecret &&
    authUrl &&
    databaseUrl &&
    databaseReachable === true;

  let hint: string;
  if (!databaseUrl) {
    hint =
      "Defina DATABASE_URL no painel Node (hPanel). O export no SSH não vale para o processo do site.";
  } else if (databaseReachable === false) {
    hint =
      "DATABASE_URL está definida, mas o MySQL não respondeu. Confira usuário, senha (codifique @ como %40), host (127.0.0.1 ou localhost) e rode no SSH: npx prisma migrate deploy.";
  } else if (!authSecret || !authUrl) {
    hint =
      "Preencha AUTH_SECRET e AUTH_URL (ou NEXTAUTH_URL) no painel e reinicie o app.";
  } else {
    hint =
      "Variáveis OK e MySQL acessível. Se o cadastro falhar, rode npm run db:seed no servidor (precisa existir um Merchant).";
  }

  return NextResponse.json(
    {
      ok,
      nodeEnv,
      checks: {
        AUTH_SECRET_or_NEXTAUTH_SECRET: authSecret,
        AUTH_URL_or_NEXTAUTH_URL: authUrl,
        DATABASE_URL: databaseUrl,
        DATABASE_REACHABLE: databaseReachable,
      },
      hint,
    },
    { status: ok ? 200 : 503 },
  );
}
