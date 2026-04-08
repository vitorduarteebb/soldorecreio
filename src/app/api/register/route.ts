import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizeWhatsappDigits } from "@/lib/whatsapp";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  whatsapp: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const { email, password, name, whatsapp: waRaw } = parsed.data;
    const whatsapp = normalizeWhatsappDigits(waRaw);
    if (!whatsapp) {
      return NextResponse.json(
        { error: "WhatsApp inválido. Use DDD + número (10 a 13 dígitos)." },
        { status: 400 },
      );
    }

    const merchant = await prisma.merchant.findFirst();
    if (!merchant) {
      return NextResponse.json(
        { error: "Sistema ainda não configurado. Contate o suporte." },
        { status: 503 },
      );
    }

    const exists = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (exists) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado." },
        { status: 409 },
      );
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        passwordHash,
        name: name.trim(),
        role: "CUSTOMER",
        merchantId: merchant.id,
        whatsapp,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[register]", e);
    const message =
      e instanceof Error ? e.message : "Erro ao cadastrar.";
    return NextResponse.json(
      {
        error: "Erro ao cadastrar. Verifique os dados ou tente mais tarde.",
        ...(process.env.NODE_ENV === "development" ? { debug: message } : {}),
      },
      { status: 500 },
    );
  }
}
