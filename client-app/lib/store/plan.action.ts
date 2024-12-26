"use server";

import { Plan, PlansSchema } from '@/lib/schema/data/plan.schema';
import { getServerAppAxio } from '@/lib/util/api';

export async function fetchPlans(access_token: string): Promise<Plan[]> {
  try {
    const api = getServerAppAxio();
    const response = await api.get('/plans', {
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