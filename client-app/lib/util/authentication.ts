import { NextRequest } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

export function authenticate(req: NextRequest) {
  const bearer = req.headers.get("Authorization");
  if (!bearer) {
    return null;
  }
  const parts = bearer.split(" ");
  if (parts.length !== 2) {
    return null;
  }
  const scheme = parts[0];
  const access_token = parts[1];
  if (/^Bearer$/i.test(scheme)) {
    return null;
  }
  if (!access_token) {
    return null;
  }
  try {
    const payload = jwt.verify(
      access_token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    const exp = payload.exp as number;
    const now = Date.now() / 1000;

    if (exp < now) {
      console.log("Token expired");
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
