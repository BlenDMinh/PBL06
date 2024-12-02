"use server";

import LoginResponseSchema from "@/lib/schema/auth/login_response.schema";
import { getServerAppAxio } from "@/lib/util/api";
import axios from "axios";
import { ApiError } from "@/lib/errors/ApiError";

export async function serverSideLogin(email: string, password: string) {
  try {
    const api = getServerAppAxio();
    const response = await api.post("/auth/login", { email, password });
    const data = LoginResponseSchema.parse(response.data);
    return data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.detail || "An error occurred during login";
      console.log(message);
      const statusCode = error.response?.status || 500;
      throw new ApiError(message, statusCode);
    } else {
      throw new ApiError("An unexpected error occurred during login");
    }
  }
}