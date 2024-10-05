import { authenticate } from "@/lib/util/authentication";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const prisma = new PrismaClient();
  const payload = authenticate(req);
  if (payload) {
    const user_id = payload.sub as string;
    const user = await prisma.user.findFirst({
      where: {
        id: parseInt(user_id),
      },
      include: {
        avatar: true,
      },
    });
    prisma.$disconnect();
    return NextResponse.json({
      message: "Already logged in",
      data: {
        user: user,
      },
    });
  }
  return NextResponse.json({ message: "Not logged in" });
}
