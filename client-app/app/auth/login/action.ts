"use server";

import LoginResponseSchema from "@/lib/schema/auth/login_response.schema";
import { api } from "@/lib/util/api";

export async function serverSideLogin(email: string, password: string) {
  const response = await api
    .post("/auth/login", { email, password })
    .catch((error) => {
      return {
        message: error.response.data.message,
        data: null,
        error: error.response.data.error,
      };
    });

  const data = LoginResponseSchema.parse(response.data);

  return data;
}
