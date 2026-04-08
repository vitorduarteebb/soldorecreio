import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const userId = session.user.id;
  const [user, purchases, notifications, redemptions, merchant] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          cashbackBalance: true,
        },
      }),
      prisma.purchase.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.cashbackRedemption.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.merchant.findFirst({
        where: { users: { some: { id: userId } } },
        select: { name: true, code: true, cashbackPercent: true },
      }),
    ]);

  return NextResponse.json({
    user,
    merchant,
    purchases,
    notifications,
    redemptions,
  });
}
