"use server";

import { getServerAppAxio } from "@/lib/util/api";
import RegisterResponseSchema from "@/lib/schema/auth/register_response.schema";
import axios from "axios";
import { ApiError } from "@/lib/errors/ApiError";

export async function serverSideRegister(email: string, password: string, username: string) {
  try {
    const api = getServerAppAxio();
    const response = await api.post("/auth/register", { email, password, username });
    const data = RegisterResponseSchema.parse(response.data);
    return data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.detail || "An error occurred during registration";
      const statusCode = error.response?.status || 500;
      throw new ApiError(message, statusCode);
    } else {
      throw new ApiError("An unexpected error occurred during registration");
    }
  }
}