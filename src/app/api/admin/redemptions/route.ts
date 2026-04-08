import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "MERCHANT_ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const merchantId = session.user.merchantId;
  if (!merchantId) {
    return NextResponse.json({ error: "Mercado não vinculado" }, { status: 400 });
  }
  const list = await prisma.cashbackRedemption.findMany({
    where: {
      user: { merchantId },
    },
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ redemptions: list });
}

const patchSchema = z.object({
  id: z.string(),
  action: z.enum(["APPROVE", "REJECT"]),
});

export async function PATCH(req: Request) {
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
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    const { id, action } = parsed.data;

    const redemption = await prisma.cashbackRedemption.findFirst({
      where: { id, user: { merchantId } },
      include: { user: true },
    });
    if (!redemption || redemption.status !== "PENDING") {
      return NextResponse.json(
        { error: "Solicitação não encontrada ou já processada." },
        { status: 404 },
      );
    }

    if (action === "APPROVE") {
      await prisma.cashbackRedemption.update({
        where: { id },
        data: { status: "APPROVED" },
      });
    } else {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: redemption.userId },
          data: { cashbackBalance: { increment: redemption.amount } },
        }),
        prisma.cashbackRedemption.update({
          where: { id },
          data: { status: "REJECTED" },
        }),
      ]);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao processar." }, { status: 500 });
  }
}
