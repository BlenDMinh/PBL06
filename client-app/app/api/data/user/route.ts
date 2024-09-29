import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json({
      message: "Success",
      data: {
        users: users,
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
