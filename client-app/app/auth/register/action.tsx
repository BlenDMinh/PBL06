"use server";

import RegisterResponseSchema from "@/lib/schema/auth/register_response.schema";
import { api } from "@/lib/util/api";

export async function serverSideRegister(email: string, password: string) {
  const response = await api
    .post("/auth/register", { email, password })
    .catch((error) => {
      return error.response;
    });

  const data = RegisterResponseSchema.parse(response.data);

  return data;
}