import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { access_token, device_id } = body;

  if (!access_token || !device_id) {
    return NextResponse.json(
      {
        message: "Bad Request",
        error: "Missing required fields",
      },
      { status: 400 }
    );
  }
  const prisma = new PrismaClient();

  try {
    const payload = jwt.verify(access_token, process.env.JWT_SECRET as string);
    const user_id = payload.sub as string;

    const user = await prisma.user.findFirst({
      where: {
        id: parseInt(user_id),
      },
      include: {
        devices: {
          where: {
            id: parseInt(device_id),
          },
        },
      },
    });

    if (!user) {
      prisma.$disconnect();
      return NextResponse.json(
        {
          message: "Not Found",
          error: "User not found",
        },
        { status: 404 }
      );
    }

    const user_device_ids = user.devices.map((device) => device.id);
    if (!user_device_ids.includes(parseInt(device_id))) {
      prisma.$disconnect();
      return NextResponse.json(
        {
          message: "Forbidden",
          error: "Device does not belong to user",
        },
        { status: 403 }
      );
    }

    await prisma.pingData.create({
      data: {
        deviceId: parseInt(device_id),
        time: new Date(),
        locationLat: 0,
        locationLong: 0,
      },
    });
    return NextResponse.json({ message: "Success" });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Unauthorized",
        error: "Invalid access token",
      },
      { status: 401 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
