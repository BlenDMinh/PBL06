"use server";

import LoginResponseSchema from "../schema/auth/login_response.schema";
import { UserSchema } from "../schema/data/user.schema";
import { api } from "../util/api";

export async function tokenLogin(access_token: string) {
  const response = await api.get("/auth/me").catch((error) => {
    return error.response;
  });
  console.log(response.data);
  // const user = UserSchema.parse(response.data.user);
  // return user;
  return null;
}
