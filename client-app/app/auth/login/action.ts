"use server";

import LoginResponseSchema from "@/lib/schema/auth/login_response.schema";
import { getServerAppAxio } from "@/lib/util/api";

export async function serverSideLogin(email: string, password: string) {
  try {
    const api = getServerAppAxio();
    const response = await api.post("/auth/login", { email, password });
    const data = LoginResponseSchema.parse(response.data);
    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}
