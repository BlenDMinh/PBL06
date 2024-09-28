"use server";

import LoginResponseSchema from "../schema/auth/login_response.schema";
import { UserSchema } from "../schema/data/user.schema";
import { api } from "../util/api";

export async function tokenLogin(access_token: string) {
  const response = await api.post("/auth/login").catch((error) => {
    return error.response.data;
  });
  const user = LoginResponseSchema.parse(response);
  console.log(user);

  if (user.data) {
    return UserSchema.parse(user.data);
  }
}
