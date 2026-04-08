import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
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
    const { email, password, name } = parsed.data;

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
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao cadastrar." }, { status: 500 });
  }
}
