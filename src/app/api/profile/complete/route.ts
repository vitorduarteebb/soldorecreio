import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizeWhatsappDigits } from "@/lib/whatsapp";

const schema = z.object({
  whatsapp: z.string().min(8),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  if (!session.user.needsProfile) {
    return NextResponse.json({ error: "Perfil já completo." }, { status: 400 });
  }
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "WhatsApp inválido" }, { status: 400 });
    }
    const whatsapp = normalizeWhatsappDigits(parsed.data.whatsapp);
    if (!whatsapp) {
      return NextResponse.json(
        { error: "WhatsApp inválido. Use DDD + número (10 a 13 dígitos)." },
        { status: 400 },
      );
    }
    await prisma.user.update({
      where: { id: session.user.id },
      data: { whatsapp },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[profile/complete]", e);
    return NextResponse.json({ error: "Erro ao salvar." }, { status: 500 });
  }
}
