import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  title: z.string().min(2),
  body: z.string().min(4),
  notifyCustomers: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "MERCHANT_ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const merchantId = session.user.merchantId;
  if (!merchantId) {
    return NextResponse.json({ error: "Mercado não vinculado" }, { status: 400 });
  }
  const list = await prisma.promotion.findMany({
    where: { merchantId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ promotions: list });
}

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
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const { title, body: promoBody, notifyCustomers } = parsed.data;
    const promotion = await prisma.promotion.create({
      data: {
        merchantId,
        title: title.trim(),
        body: promoBody.trim(),
      },
    });

    if (notifyCustomers) {
      const customers = await prisma.user.findMany({
        where: { merchantId, role: "CUSTOMER" },
        select: { id: true },
      });
      await prisma.notification.createMany({
        data: customers.map((c) => ({
          userId: c.id,
          title: `Promoção: ${promotion.title}`,
          body: promotion.body,
        })),
      });
    }

    return NextResponse.json({ promotion });
  } catch {
    return NextResponse.json({ error: "Erro ao criar promoção." }, { status: 500 });
  }
}
