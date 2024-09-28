import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authenticate } from "@/lib/util/authentication";

export async function POST(req: NextRequest) {
  const prisma = new PrismaClient();
  const payload = authenticate(req);
  if (payload) {
    const user_id = payload.sub as string;
    const user = await prisma.user.findFirst({
      where: {
        id: parseInt(user_id),
      },
      include: {
        role: true,
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
  try {
    const json = await req.json();
    const { email, password } = json;
    if (!email || !password) {
      return NextResponse.json(
        { error: "Bad request", message: "Email and password are required" },
        { status: 400 }
      );
    }
    const loginData = await prisma.loginData.findFirst({
      where: {
        user: {
          email: email,
        },
      },
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
    });
    if (loginData && bcrypt.compareSync(password, loginData.hashedPassword)) {
      const refresh_token = jwt.sign(
        {
          sub: loginData.user.id,
          iat: Date.now() / 1000,
          iss: "https://example.com",
        },
        process.env.JWT_SECRET as string,
        {
          expiresIn: process.env.REFRESH_TOKEN_EXPI,
        }
      );
      const access_token = jwt.sign(
        {
          sub: loginData.user.id,
          iat: Date.now() / 1000,
          iss: "https://example.com",
        },
        process.env.JWT_SECRET as string,
        { expiresIn: process.env.ACCESS_TOKEN_EXPI }
      );
      const response = NextResponse.json({
        message: "Logged in",
        data: {
          user: loginData.user,
          access_token: access_token,
          refresh_token: refresh_token,
        },
      });
      return response;
    }
    return NextResponse.json(
      { message: "Invalid email or password" },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Email and password are required", error: "Bad request" },
      { status: 400 }
    );
  } finally {
    prisma.$disconnect();
  }
}
