import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create some plans
  const basicPlan = await prisma.plan.create({
    data: {
      name: 'Basic',
      monthy_token: 100,
      daily_token: 10,
      price: 9.99,
    },
  });

  const premiumPlan = await prisma.plan.create({
    data: {
      name: 'Premium',
      monthy_token: 1000,
      daily_token: 100,
      price: 49.99,
    },
  });

  // Create a user
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      username: 'exampleUser',
    },
  });

  // Create a subscription for the user
  await prisma.subsctiption.create({
    data: {
      user: {
        connect: { id: user.id },
      },
      plan: {
        connect: { id: basicPlan.id },
      },
    },
  });

  // Create an account for the user
  await prisma.account.create({
    data: {
      email: 'user_account@example.com',
      password: 'securepassword',
      user: {
        connect: { id: user.id },
      },
    },
  });

  // Create an image
  const image = await prisma.image.create({
    data: {
      image_url: 'https://example.com/image.png',
    },
  });

  // Create a query for the user
  await prisma.query.create({
    data: {
      query: 'Example query',
      user: {
        connect: { id: user.id },
      },
      image: {
        connect: { id: image.id },
      },
      result: 'PENDING',
      used_token: 5,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
