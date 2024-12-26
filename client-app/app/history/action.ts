// action.ts
"use server";

import { getServerAppAxio } from "@/lib/util/api";
import { QueriesSchema } from "@/lib/schema/data/query.schema";

export async function getHistory(access_token: string, page = 1) {
  try {
    const api = getServerAppAxio();
    const response = await api.get(`/queries?page=${page}&size=10`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    const data = QueriesSchema.parse(response.data.items);
    return { histories: data, total: response.data.total };
  } catch (error: any) {
    console.log(error);
  }
  return { histories: [], total: 0 };
}
