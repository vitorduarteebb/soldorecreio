import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  cashbackPercent: z.number().min(0).max(100),
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
  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
  });
  return NextResponse.json({ merchant });
}

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
      return NextResponse.json({ error: "Percentual inválido" }, { status: 400 });
    }
    const merchant = await prisma.merchant.update({
      where: { id: merchantId },
      data: { cashbackPercent: parsed.data.cashbackPercent },
    });
    return NextResponse.json({ merchant });
  } catch {
    return NextResponse.json({ error: "Erro ao salvar." }, { status: 500 });
  }
}
