import "@/lib/env-bootstrap";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tables = await prisma.$queryRaw<
      { TABLE_NAME: string }[]
    >`SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME`;

    const names = tables.map((t) => t.TABLE_NAME);
    const interesting = names.filter((n) =>
      /user|merchant|purchase|cashback|redemption|cliente|customer|sr_/i.test(n),
    );

    const counts: Record<string, number | string> = {};
    for (const table of interesting) {
      try {
        const rows = await prisma.$queryRawUnsafe<{ c: bigint }[]>(
          `SELECT COUNT(*) as c FROM \`${table}\``,
        );
        counts[table] = Number(rows[0]?.c ?? 0);
      } catch (e) {
        counts[table] = e instanceof Error ? e.message : "erro";
      }
    }

    const dbName = await prisma.$queryRaw<{ db: string }[]>`SELECT DATABASE() as db`;

    const schemas = await prisma.$queryRaw<
      { SCHEMA_NAME: string }[]
    >`SELECT SCHEMA_NAME FROM information_schema.SCHEMATA ORDER BY SCHEMA_NAME`;

    const legacyTables = await prisma.$queryRaw<
      { TABLE_SCHEMA: string; TABLE_ROWS: bigint | null }[]
    >`SELECT TABLE_SCHEMA, TABLE_ROWS
      FROM information_schema.TABLES
      WHERE TABLE_NAME = 'users'
      ORDER BY TABLE_SCHEMA`;

    const crossDb: Record<string, unknown> = {};
    for (const { SCHEMA_NAME } of schemas) {
      try {
        const rows = await prisma.$queryRawUnsafe<
          { tableName: string; cnt: bigint | null }[]
        >(
          `SELECT TABLE_NAME as tableName, TABLE_ROWS as cnt
           FROM information_schema.TABLES
           WHERE TABLE_SCHEMA = '${SCHEMA_NAME}'
             AND TABLE_NAME IN ('User','Merchant','Purchase','CashbackRedemption','sr_User','sr_Merchant','sr_Purchase','sr_CashbackRedemption','customers','clientes','users')
           ORDER BY TABLE_NAME`,
        );
        if (rows.length) {
          crossDb[SCHEMA_NAME] = Object.fromEntries(
            rows.map((r) => [r.tableName, Number(r.cnt ?? 0)]),
          );
        }
      } catch {
        crossDb[SCHEMA_NAME] = "sem permissão ou erro";
      }
    }

    const allDbTables = await prisma.$queryRaw<
      { TABLE_SCHEMA: string; TABLE_NAME: string; TABLE_ROWS: bigint | null }[]
    >`SELECT TABLE_SCHEMA, TABLE_NAME, TABLE_ROWS
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA LIKE 'u494944867_%'
        AND (
          TABLE_NAME IN ('User','Merchant','Purchase','CashbackRedemption','Notification','Promotion','Account')
          OR TABLE_NAME LIKE 'sr_%'
        )
      ORDER BY TABLE_SCHEMA, TABLE_NAME`;

    return NextResponse.json({
      database: dbName[0]?.db ?? null,
      totalTables: names.length,
      interestingTables: interesting,
      rowCounts: counts,
      allHostingerSchemas: schemas.map((s) => s.SCHEMA_NAME),
      legacyUsersTables: legacyTables.map((r) => ({
        schema: r.TABLE_SCHEMA,
        approxRows: r.TABLE_ROWS != null ? Number(r.TABLE_ROWS) : null,
      })),
      crossDatabaseCounts: crossDb,
      allHostingerDatabases: allDbTables.map((r) => ({
        schema: r.TABLE_SCHEMA,
        table: r.TABLE_NAME,
        approxRows: r.TABLE_ROWS != null ? Number(r.TABLE_ROWS) : null,
      })),
      hint:
        "Se existirem tabelas User/Merchant (sem sr_) com dados, o painel antigo usava outro schema. Tabelas sr_* são do deploy recente (vazias ou só demo).",
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "Falha ao inspecionar banco",
      },
      { status: 500 },
    );
  }
}
