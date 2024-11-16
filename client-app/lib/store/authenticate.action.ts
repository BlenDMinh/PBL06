"use server";

import { UserSchema } from "../schema/data/user.schema";
import api from "../util/api"; 

export async function tokenLogin(access_token: string) {
  console.log(access_token);
  const response = await api
    .get("/auth/me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
    .catch((error: any) => {
      return error.response;
    });
  console.log(response.data);
  const user = UserSchema.parse(response.data.data.user);
  return user;
}
