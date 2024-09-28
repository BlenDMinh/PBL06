import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.role.createManyAndReturn({
    data: [
      {
        name: "admin",
        permissions: 0,
      },
      {
        name: "user",
        permissions: 0,
      },
    ],
  });
  console.log("Seeding roles:", roles);

  const user = await prisma.user.create({
    data: {
      email: "themysmine@gmail.com",
      name: "BlenDMinh",
      roleId: roles[0].id,
    },
  });
  console.log("Seeding user:", user);

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync("ComTMM0112", salt);

  const loginData = await prisma.loginData.create({
    data: {
      userId: user.id,
      hashedPassword: hashedPassword,
    },
  });

  console.log("Seeding loginData:", loginData);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
