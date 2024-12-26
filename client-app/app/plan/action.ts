"use server";

import { Plan, PlansSchema } from "@/lib/schema/data/plan.schema";
import { getServerAppAxio } from "@/lib/util/api";

export async function fetchPlans(access_token: string): Promise<Plan[]> {
  try {
    const api = getServerAppAxio();
    const response = await api.get("/plans", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    const plans = PlansSchema.parse(response.data);
    return plans;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function changeSubscription(
  user_id: number,
  plan_id: number,
  subscription_id: number,
  access_token: string
): Promise<boolean> {
  try {
    const api = getServerAppAxio();
    await api.put(
      `/subscriptions/${subscription_id}`,
      {
        user_id,
        plan_id,
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}
