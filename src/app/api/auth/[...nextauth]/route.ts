import { handlers } from "@/auth";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function wrap(
  handler: (
    req: NextRequest,
    ctx: { params: Promise<{ nextauth: string[] }> },
  ) => Promise<Response> | Response,
) {
  return async (
    req: NextRequest,
    ctx: { params: Promise<{ nextauth: string[] }> },
  ) => {
    try {
      return await handler(req, ctx);
    } catch (e) {
      console.error("[nextauth]", e);
      const msg = e instanceof Error ? e.message : String(e);
      return NextResponse.json(
        {
          error: "AuthError",
          message: msg,
          hint:
            "Confira AUTH_SECRET, AUTH_URL (ou NEXTAUTH_URL) e DATABASE_URL no painel. GET /api/health para diagnóstico.",
        },
        { status: 500 },
      );
    }
  };
}

export const GET = wrap(handlers.GET);
export const POST = wrap(handlers.POST);
