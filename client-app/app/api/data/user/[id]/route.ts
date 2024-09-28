import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const prisma = new PrismaClient();
  const user = await prisma.user.findFirst({
    where: {
      id: parseInt(params.id),
    },
    include: {
      role: true,
    },
  });
  prisma.$disconnect();

  return NextResponse.json({
    message: "Success",
    data: {
      user: user,
    },
  });
}
