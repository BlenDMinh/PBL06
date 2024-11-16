"use server";

import RegisterResponseSchema from "@/lib/schema/auth/register_response.schema";
import api from "@/lib/util/api";

export async function serverSideRegister(email: string, password: string, username: string) {
  try {
    const response = await api.post("/auth/register", { email, password, username });
    const data = RegisterResponseSchema.parse(response.data);
    return data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}