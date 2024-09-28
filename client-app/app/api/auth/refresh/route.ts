import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

export async function GET(req: NextRequest, res: NextResponse) {
  const searchParams = req.nextUrl.searchParams;
  const refresh_token = searchParams.get("refresh_token");

  if (!refresh_token) {
    return NextResponse.json(
      { message: "Failed", error: "refresh_token is required" },
      { status: 400 }
    );
  }

  try {
    const token = jwt.verify(
      refresh_token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    if (token.exp! < Date.now()) {
      return NextResponse.json(
        { message: "Failed", error: "Refresh token is expired" },
        { status: 401 }
      );
    }

    const access_token = jwt.sign(
      {
        sub: token.sub,
        iat: Date.now(),
        iss: "https://example.com",
      },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.ACCESS_TOKEN_EXPI }
    );
    return NextResponse.json({ message: "Success", access_token });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed", error: "Refresh token is not valid or expired" },
      { status: 401 }
    );
  }
}
