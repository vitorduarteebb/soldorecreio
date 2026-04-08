import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Diagnóstico rápido no deploy (não expõe segredos).
 * Abra GET /api/health no navegador e confira o que falta.
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

  const ok = authSecret && authUrl && databaseUrl;

  return NextResponse.json(
    {
      ok,
      nodeEnv,
      checks: {
        AUTH_SECRET_or_NEXTAUTH_SECRET: authSecret,
        AUTH_URL_or_NEXTAUTH_URL: authUrl,
        DATABASE_URL: databaseUrl,
      },
      hint: ok
        ? "Variáveis mínimas parecem definidas. Se ainda houver erro, veja logs do servidor e conexão MySQL."
        : "Preencha no painel da hospedagem as variáveis que estão false e faça redeploy.",
    },
    { status: ok ? 200 : 503 },
  );
}
