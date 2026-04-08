import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const MERCHANT_NAME = "Sol do Recreio";

async function main() {
  let merchant = await prisma.merchant.findFirst();
  if (!merchant) {
    merchant = await prisma.merchant.create({
      data: {
        name: MERCHANT_NAME,
        cashbackPercent: 5,
      },
    });
  } else {
    merchant = await prisma.merchant.update({
      where: { id: merchant.id },
      data: { name: MERCHANT_NAME },
    });
  }

  const adminHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@mercado.com" },
    create: {
      email: "admin@mercado.com",
      passwordHash: adminHash,
      name: "Administrador",
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

  console.log("Seed OK —", merchant.name);
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
