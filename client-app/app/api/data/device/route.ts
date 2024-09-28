import { authenticate } from "@/lib/util/authentication";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const payload = authenticate(req);
  if (!payload) {
    return NextResponse.json(
      { message: "Failed", error: "Unauthorized" },
      { status: 401 }
    );
  }
  const user_id = parseInt(payload.sub as string);

  const prisma = new PrismaClient();
  try {
    const devices = await prisma.device.findMany({
      where: {
        owner: {
          id: user_id,
        },
      },
    });

    return NextResponse.json({
      message: "Success",
      data: {
        devices: devices,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed", error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  const payload = authenticate(req);
  if (!payload) {
    return NextResponse.json(
      { message: "Failed", error: "Unauthorized" },
      { status: 401 }
    );
  }
  const user_id = parseInt(payload.sub as string);
  console.log(user_id);

  const prisma = new PrismaClient();
  try {
    const body = await req.json();
    const { name } = body;

    const device = await prisma.device.create({
      data: {
        name: name,
        isOn: false,
        owner: {
          connect: {
            id: user_id,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Success",
      data: {
        device: device,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed", error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
