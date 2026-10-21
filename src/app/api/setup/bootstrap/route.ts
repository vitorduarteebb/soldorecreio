import "@/lib/env-bootstrap";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  name: z.string().min(2).optional(),
});

const DEFAULT_EMAIL = "admin@mercado.com";
const DEFAULT_PASSWORD = "admin123";
const DEFAULT_NAME = "Administrador";
const MIGRATE_TOKEN =
  process.env.SETUP_TOKEN?.trim() || "solrecreio-migrate-20260713";
const ADMIN_MIGRATE_PASSWORD = "SolRecreio@2026";

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

function mapLegacyRole(role: string): string {
  return role.trim().toUpperCase() === "ADMIN" ? "MERCHANT_ADMIN" : "CUSTOMER";
}

async function locateLegacySchema(): Promise<string | null> {
  const current = await prisma.$queryRaw<{ db: string }[]>`SELECT DATABASE() as db`;
  const db = current[0]?.db;
  if (db) {
    const inCurrent = await prisma.$queryRaw<{ c: bigint }[]>`
      SELECT COUNT(*) as c
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ${db}
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME IN ('password_hash', 'passwordHash')
    `;
    if (Number(inCurrent[0]?.c ?? 0) > 0) return db;
  }

  const rows = await prisma.$queryRaw<{ TABLE_SCHEMA: string }[]>`
    SELECT DISTINCT TABLE_SCHEMA
    FROM information_schema.COLUMNS
    WHERE TABLE_NAME = 'users'
      AND COLUMN_NAME IN ('password_hash', 'passwordHash')
      AND TABLE_SCHEMA LIKE 'u494944867_%'
  `;
  if (rows.length === 0) return null;
  const preferred =
    rows.find((r) => r.TABLE_SCHEMA.includes("_sol")) ??
    rows.find((r) => r.TABLE_SCHEMA.includes("horyzonn")) ??
    rows[0];
  return preferred.TABLE_SCHEMA;
}

async function readLegacyUsers(schema: string): Promise<LegacyRow[]> {
  const cols = await prisma.$queryRaw<{ COLUMN_NAME: string }[]>`
    SELECT COLUMN_NAME
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = ${schema} AND TABLE_NAME = 'users'
  `;
  const names = new Set(cols.map((c) => c.COLUMN_NAME));
  const hashCol = names.has("password_hash")
    ? "password_hash"
    : names.has("passwordHash")
      ? "passwordHash"
      : null;
  if (!hashCol) {
    throw new Error(`Tabela users em ${schema} sem coluna de senha.`);
  }

  return prisma.$queryRawUnsafe<LegacyRow[]>(
    `SELECT id, email, \`${hashCol}\` as password_hash, name, phone, role, cashback_balance, created_at
     FROM \`${schema}\`.\`users\`
     ORDER BY id`,
  );
}

async function migrateLegacyUsers() {
  const schema = await locateLegacySchema();
  if (!schema) {
    return NextResponse.json(
      {
        error: "Tabela legada users não encontrada.",
        hint: "Informe o schema no body: { \"migrateLegacy\": true, \"schema\": \"nome_do_banco\" }",
      },
      { status: 404 },
    );
  }
  return migrateLegacyUsersFromSchema(schema);
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

async function migrateLegacyUsersFromSchema(schema: string) {
  if (schema === "u494944867_sol") {
    try {
      const merchant = await ensureMerchant();
      const adminHash = await bcrypt.hash(ADMIN_MIGRATE_PASSWORD, 10);
      const hashSql = adminHash.replace(/'/g, "''");
      const merchantIdSql = merchant.id.replace(/'/g, "''");
      await prisma.$executeRawUnsafe(`
        INSERT INTO u494944867_horyzonn.sr_User (
          id, email, passwordHash, name, role, merchantId, whatsapp, cashbackBalance, createdAt, updatedAt
        )
        SELECT
          CONCAT('legacy-', u.id),
          LOWER(TRIM(u.email)),
          CASE WHEN UPPER(u.role) = 'ADMIN' THEN '${hashSql}' ELSE u.password_hash END,
          COALESCE(NULLIF(TRIM(u.name), ''), SUBSTRING_INDEX(u.email, '@', 1)),
          CASE WHEN UPPER(u.role) = 'ADMIN' THEN 'MERCHANT_ADMIN' ELSE 'CUSTOMER' END,
          '${merchantIdSql}',
          NULLIF(TRIM(u.phone), ''),
          COALESCE(u.cashback_balance, 0),
          COALESCE(u.created_at, NOW()),
          NOW()
        FROM u494944867_sol.users u
        WHERE u.email IS NOT NULL AND TRIM(u.email) <> ''
        ON DUPLICATE KEY UPDATE
          passwordHash = VALUES(passwordHash),
          name = VALUES(name),
          role = VALUES(role),
          merchantId = VALUES(merchantId),
          whatsapp = VALUES(whatsapp),
          cashbackBalance = VALUES(cashbackBalance),
          updatedAt = NOW()
      `);
      const total = await prisma.user.count();
      const customers = await prisma.user.count({ where: { role: "CUSTOMER" } });
      return NextResponse.json({
        ok: true,
        migrated: true,
        schema: "u494944867_sol",
        mode: "cross-database-sql",
        totalSrUsers: total,
        customerCount: customers,
        adminPassword: ADMIN_MIGRATE_PASSWORD,
        message: "Migração de u494944867_sol.users concluída.",
      });
    } catch (e) {
      return NextResponse.json(
        {
          error: e instanceof Error ? e.message : "Falha na migração cross-database",
          hint: "Rode o SQL em prisma/migrations/migrate_sol_users_to_horyzonn.sql no phpMyAdmin.",
        },
        { status: 500 },
      );
    }
  }

  const legacy = await readLegacyUsers(schema);
  const merchant = await ensureMerchant();
  const adminHash = await bcrypt.hash(ADMIN_MIGRATE_PASSWORD, 10);
  let created = 0;
  let updated = 0;
  const errors: string[] = [];

  for (const row of legacy) {
    const email = row.email.trim().toLowerCase();
    if (!email) continue;

    const role = mapLegacyRole(row.role);
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

  const adminEmails = legacy
    .filter((u) => u.role.toUpperCase() === "ADMIN")
    .map((u) => u.email.trim().toLowerCase());

  return NextResponse.json({
    ok: true,
    migrated: true,
    schema,
    legacyProcessed: legacy.length,
    created,
    updated,
    totalSrUsers: await prisma.user.count(),
    adminEmails,
    adminPassword: ADMIN_MIGRATE_PASSWORD,
    clientPasswordHint:
      "Clientes mantêm a senha que já usavam no sistema antigo.",
    errors: errors.length ? errors : undefined,
  });
}

async function ensureSchema() {
  await prisma.$queryRaw`SELECT 1`;
  try {
    await prisma.merchant.findFirst({ select: { id: true } });
    return;
  } catch {
    // tabela ausente — aplica migration inicial
  }

  const migrationPath = join(process.cwd(), "prisma/migrations/sr_tables_mysql.sql");
  const sql = readFileSync(migrationPath, "utf8");
  const statements = sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const statement of statements) {
    try {
      await prisma.$executeRawUnsafe(`${statement};`);
    } catch {
      // ignora FK/índice duplicado em reexecução
    }
  }
}

export async function GET() {
  try {
    await ensureSchema();
    const adminCount = await prisma.user.count({
      where: { role: "MERCHANT_ADMIN" },
    });
    const merchant = await prisma.merchant.findFirst({ select: { id: true, name: true } });
    const legacySchema = await locateLegacySchema();
    let legacyCount: number | null = null;
    if (legacySchema) {
      const rows = await readLegacyUsers(legacySchema);
      legacyCount = rows.length;
    }
    return NextResponse.json({
      hasAdmin: adminCount > 0,
      adminCount,
      hasMerchant: Boolean(merchant),
      merchantName: merchant?.name ?? null,
      legacySchema,
      legacyUserCount: legacyCount,
    });
  } catch (e) {
    console.error("[setup/bootstrap GET]", e);
    return NextResponse.json(
      { error: "Não foi possível consultar o banco." },
      { status: 503 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await ensureSchema();

    const raw = await req.json().catch(() => ({}));

    if (
      raw &&
      typeof raw === "object" &&
      (raw as { migrateLegacy?: boolean }).migrateLegacy === true
    ) {
      const migrateToken = req.headers.get("x-setup-token")?.trim();
      if (migrateToken !== MIGRATE_TOKEN) {
        return NextResponse.json({ error: "Token inválido." }, { status: 401 });
      }
      const schemaOverride = (raw as { schema?: string }).schema?.trim();
      if (schemaOverride) {
        return migrateLegacyUsersFromSchema(schemaOverride);
      }
      return migrateLegacyUsers();
    }

    if (
      raw &&
      typeof raw === "object" &&
      (raw as { ensureAdmin?: { email?: string; password?: string; name?: string } })
        .ensureAdmin
    ) {
      const migrateToken = req.headers.get("x-setup-token")?.trim();
      if (migrateToken !== MIGRATE_TOKEN) {
        return NextResponse.json({ error: "Token inválido." }, { status: 401 });
      }
      const cfg = (raw as { ensureAdmin: { email?: string; password?: string; name?: string } })
        .ensureAdmin;
      const email = (cfg.email ?? "admin@gmail.com").trim().toLowerCase();
      const password = cfg.password ?? ADMIN_MIGRATE_PASSWORD;
      const name = cfg.name ?? "Administrador";
      const merchant = await ensureMerchant();
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.upsert({
        where: { email },
        create: {
          email,
          passwordHash,
          name,
          role: "MERCHANT_ADMIN",
          merchantId: merchant.id,
        },
        update: {
          passwordHash,
          name,
          role: "MERCHANT_ADMIN",
          merchantId: merchant.id,
        },
      });
      return NextResponse.json({
        ok: true,
        email: user.email,
        password,
        role: user.role,
        message: "Administrador configurado.",
      });
    }

    const setupToken = process.env.SETUP_TOKEN?.trim();
    const headerToken = req.headers.get("x-setup-token")?.trim();
    const tokenOk = Boolean(setupToken && headerToken && setupToken === headerToken);

    const adminCount = await prisma.user.count({
      where: { role: "MERCHANT_ADMIN" },
    });
    if (adminCount > 0 && !tokenOk) {
      return NextResponse.json(
        {
          error: "Já existe administrador cadastrado.",
          hint: "Use as credenciais existentes ou defina SETUP_TOKEN no servidor para recriar.",
        },
        { status: 409 },
      );
    }

    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const email = (parsed.data.email ?? DEFAULT_EMAIL).trim().toLowerCase();
    const password = parsed.data.password ?? DEFAULT_PASSWORD;
    const name = parsed.data.name ?? DEFAULT_NAME;

    let merchant = await prisma.merchant.findFirst();
    if (!merchant) {
      merchant = await prisma.merchant.create({
        data: { name: "Sol do Recreio", cashbackPercent: 5 },
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        passwordHash,
        name,
        role: "MERCHANT_ADMIN",
        merchantId: merchant.id,
        whatsapp: null,
      },
      update: {
        passwordHash,
        name,
        role: "MERCHANT_ADMIN",
        merchantId: merchant.id,
      },
    });

    return NextResponse.json({
      ok: true,
      email: user.email,
      name: user.name,
      role: user.role,
      message: "Administrador criado com sucesso.",
    });
  } catch (e) {
    console.error("[setup/bootstrap POST]", e);
    return NextResponse.json(
      { error: "Erro ao criar administrador. Verifique DATABASE_URL e migrações." },
      { status: 500 },
    );
  }
}
