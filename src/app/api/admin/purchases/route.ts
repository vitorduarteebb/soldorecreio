import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  customerEmail: z.string().email(),
  amount: z.number().positive(),
  note: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "MERCHANT_ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const merchantId = session.user.merchantId;
  if (!merchantId) {
    return NextResponse.json({ error: "Mercado não vinculado" }, { status: 400 });
  }
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const { customerEmail, amount, note } = parsed.data;
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
    });
    if (!merchant) {
      return NextResponse.json({ error: "Mercado não encontrado" }, { status: 404 });
    }
    const customer = await prisma.user.findFirst({
      where: {
        email: customerEmail.trim().toLowerCase(),
        merchantId,
        role: "CUSTOMER",
      },
    });
    if (!customer) {
      return NextResponse.json(
        { error: "Cliente não encontrado neste mercado." },
        { status: 404 },
      );
    }
    const pct = merchant.cashbackPercent;
    const cashbackAmount = Math.round(amount * (pct / 100) * 100) / 100;

    await prisma.$transaction([
      prisma.purchase.create({
        data: {
          userId: customer.id,
          merchantId,
          amount,
          cashbackPercent: pct,
          cashbackAmount,
          note: note?.trim() || null,
        },
      }),
      prisma.user.update({
        where: { id: customer.id },
        data: {
          cashbackBalance: { increment: cashbackAmount },
        },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      cashbackAmount,
      cashbackPercent: pct,
    });
  } catch {
    return NextResponse.json({ error: "Erro ao registrar compra." }, { status: 500 });
  }
}
