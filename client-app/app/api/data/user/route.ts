import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const prisma = new PrismaClient();
  const users = await prisma.user.findMany();
  prisma.$disconnect();

  return NextResponse.json({
    message: "Success",
    data: {
      users: users,
    },
  });
}
