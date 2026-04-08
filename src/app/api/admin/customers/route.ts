import { NextResponse } from "next/server";
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
  const users = await prisma.user.findMany({
    where: { merchantId, role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      whatsapp: true,
      cashbackBalance: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ customers: users });
}
