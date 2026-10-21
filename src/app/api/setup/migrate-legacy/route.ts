import "@/lib/env-bootstrap";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIGRATE_TOKEN =
  process.env.SETUP_TOKEN?.trim() || "solrecreio-migrate-20260713";

/** Senha definida para admins migrados (login imediato após migração). */
const ADMIN_PASSWORD = "SolRecreio@2026";

type LegacyRow = {
  id: number;
  email: string;
  password_hash: string;
  name: string | null;
  phone: string | null;
  role: string;
  cashback_balance: number | string | null;
  created_at: Date;
};

function mapRole(role: string): string {
  return role.trim().toUpperCase() === "ADMIN" ? "MERCHANT_ADMIN" : "CUSTOMER";
}

async function locateLegacySchema(): Promise<string | null> {
  const rows = await prisma.$queryRaw<{ TABLE_SCHEMA: string }[]>`
    SELECT DISTINCT TABLE_SCHEMA
    FROM information_schema.COLUMNS
    WHERE TABLE_NAME = 'users'
      AND COLUMN_NAME = 'password_hash'
      AND TABLE_SCHEMA LIKE 'u494944867_%'
  `;
  if (rows.length === 0) return null;
  const preferred =
    rows.find((r) => r.TABLE_SCHEMA.includes("horyzonn")) ?? rows[0];
  return preferred.TABLE_SCHEMA;
}

async function readLegacyUsers(schema: string): Promise<LegacyRow[]> {
  return prisma.$queryRawUnsafe<LegacyRow[]>(
    `SELECT id, email, password_hash, name, phone, role, cashback_balance, created_at
     FROM \`${schema}\`.\`users\`
     ORDER BY id`,
  );
}

async function ensureMerchant() {
  let merchant = await prisma.merchant.findFirst();
  if (!merchant) {
    merchant = await prisma.merchant.create({
      data: { name: "Sol do Recreio", cashbackPercent: 5 },
    });
  } else if (merchant.name !== "Sol do Recreio") {
    merchant = await prisma.merchant.update({
      where: { id: merchant.id },
      data: { name: "Sol do Recreio" },
    });
  }
  return merchant;
}

export async function GET() {
  try {
    const schema = await locateLegacySchema();
    if (!schema) {
      return NextResponse.json({
        found: false,
        message: "Tabela legada users não encontrada nos bancos u494944867_*.",
      });
    }

    const legacy = await readLegacyUsers(schema);
    const current = await prisma.user.count();
    const admins = legacy.filter((u) => u.role.toUpperCase() === "ADMIN");

    return NextResponse.json({
      found: true,
      schema,
      legacyCount: legacy.length,
      currentSrUserCount: current,
      legacyAdmins: admins.map((a) => a.email),
      hint: "POST com header x-setup-token para executar a migração.",
    });
  } catch (e) {
    console.error("[setup/migrate-legacy GET]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Falha ao inspecionar" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const token = req.headers.get("x-setup-token")?.trim();
  if (token !== MIGRATE_TOKEN) {
    return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  }

  try {
    const schema = await locateLegacySchema();
    if (!schema) {
      return NextResponse.json(
        { error: "Tabela legada users não encontrada." },
        { status: 404 },
      );
    }

    const legacy = await readLegacyUsers(schema);
    const merchant = await ensureMerchant();
    const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const row of legacy) {
      const email = row.email.trim().toLowerCase();
      if (!email) continue;

      const role = mapRole(row.role);
      const isAdmin = role === "MERCHANT_ADMIN";
      const passwordHash = isAdmin ? adminHash : row.password_hash;
      const cashback =
        row.cashback_balance != null ? Number(row.cashback_balance) : 0;
      const whatsapp = row.phone?.trim() || null;
      const name = row.name?.trim() || email.split("@")[0];

      try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
          await prisma.user.update({
            where: { email },
            data: {
              passwordHash,
              name,
              role,
              merchantId: merchant.id,
              whatsapp,
              cashbackBalance: cashback,
            },
          });
          updated++;
        } else {
          await prisma.user.create({
            data: {
              email,
              passwordHash,
              name,
              role,
              merchantId: merchant.id,
              whatsapp,
              cashbackBalance: cashback,
              createdAt: row.created_at ? new Date(row.created_at) : undefined,
            },
          });
          created++;
        }
      } catch (e) {
        errors.push(
          `${email}: ${e instanceof Error ? e.message : "erro desconhecido"}`,
        );
      }
    }

    const total = await prisma.user.count();
    const adminEmails = legacy
      .filter((u) => u.role.toUpperCase() === "ADMIN")
      .map((u) => u.email.trim().toLowerCase());

    return NextResponse.json({
      ok: true,
      schema,
      legacyProcessed: legacy.length,
      created,
      updated,
      totalSrUsers: total,
      adminEmails,
      adminPassword: ADMIN_PASSWORD,
      clientPasswordHint:
        "Clientes mantêm a senha que já usavam no sistema antigo.",
      errors: errors.length ? errors : undefined,
    });
  } catch (e) {
    console.error("[setup/migrate-legacy POST]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Falha na migração" },
      { status: 500 },
    );
  }
}
