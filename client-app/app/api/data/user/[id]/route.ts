import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: parseInt(params.id),
      },
      include: {
        avatar: true,
      },
    });
    return NextResponse.json({
      message: "Success",
      data: {
        user: user,
      },
    });
  } catch (error) {
    return NextResponse.json({
      message: "Error",
      error: error,
    });
  } finally {
    await prisma.$disconnect();
  }
}
