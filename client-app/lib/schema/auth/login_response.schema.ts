import WrapperResponse from "../wrapper.schema";
import { UserSchema } from "../data/user.schema";
import { z } from "zod";
import { SubscriptionSchema } from "../data/subscription";

const LoginResponseSchema = WrapperResponse.extend({
  data: z
    .object({
      user: UserSchema,
      subscription: SubscriptionSchema,
      access_token: z.string(),
      refresh_token: z.string(),
    })
    .nullish(),
});

export default LoginResponseSchema;
