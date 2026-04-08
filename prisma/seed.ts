import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const merchant = await prisma.merchant.upsert({
    where: { code: "SOL2026" },
    create: {
      name: "Mercado Sol do Recreio",
      code: "SOL2026",
      cashbackPercent: 5,
    },
    update: {},
  });

  const adminHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@mercado.com" },
    create: {
      email: "admin@mercado.com",
      passwordHash: adminHash,
      name: "Administrador do Mercado",
      role: "MERCHANT_ADMIN",
      merchantId: merchant.id,
    },
    update: {
      passwordHash: adminHash,
      merchantId: merchant.id,
    },
  });

  const clienteHash = await bcrypt.hash("cliente123", 10);
  await prisma.user.upsert({
    where: { email: "cliente@demo.com" },
    create: {
      email: "cliente@demo.com",
      passwordHash: clienteHash,
      name: "Cliente Demo",
      role: "CUSTOMER",
      merchantId: merchant.id,
    },
    update: {
      passwordHash: clienteHash,
      merchantId: merchant.id,
    },
  });

  console.log("Seed OK — mercado:", merchant.name, "| código filiação:", merchant.code);
  console.log("Admin: admin@mercado.com / admin123");
  console.log("Cliente: cliente@demo.com / cliente123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
