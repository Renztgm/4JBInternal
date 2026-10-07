require("dotenv").config();
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env");

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, password: await bcrypt.hash(password, 10), role: "ADMIN" },
  });
  console.log("Admin ready:", email);
}

main().finally(() => prisma.$disconnect());