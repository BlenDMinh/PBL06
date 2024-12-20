"use server";

import { error } from "console";
import { UserSchema } from "../schema/data/user.schema";
import { SubscriptionSchema } from "../schema/data/subscription";
import { getServerAppAxio } from "../util/api";

export async function tokenLogin(access_token: string) {
  const api = getServerAppAxio();
  const response = await api
    .get("/auth/me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
    .catch((error) => {
      return error.response;
    });
  if (response.status != 200) {
    console.error(
      `${response.config.method} ${response.status}: ${response.data}`
    );
    return null;
  }
  const user = UserSchema.parse(response.data.data.user);
  const subscription = SubscriptionSchema.parse(response.data.data.subscription);
  return { user, subscription };
}