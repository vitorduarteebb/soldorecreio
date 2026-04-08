import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  amount: z.number().positive(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const userId = session.user.id;
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
    }
    const { amount } = parsed.data;
    const rounded = Math.round(amount * 100) / 100;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user || user.cashbackBalance < rounded) {
        throw new Error("INSUFFICIENT");
      }
      await tx.user.update({
        where: { id: userId },
        data: { cashbackBalance: { decrement: rounded } },
      });
      const redemption = await tx.cashbackRedemption.create({
        data: {
          userId,
          amount: rounded,
          status: "PENDING",
        },
      });
      return redemption;
    });

    return NextResponse.json({ redemption: result });
  } catch (e) {
    if (e instanceof Error && e.message === "INSUFFICIENT") {
      return NextResponse.json(
        { error: "Saldo de cashback insuficiente." },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Erro ao solicitar resgate." }, { status: 500 });
  }
}
