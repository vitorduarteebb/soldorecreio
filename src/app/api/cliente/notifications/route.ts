import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const userId = session.user.id;
  try {
    const body = await req.json();
    const schema = z.object({ id: z.string() });
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    await prisma.notification.updateMany({
      where: { id: parsed.data.id, userId },
      data: { read: true },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro." }, { status: 500 });
  }
}
