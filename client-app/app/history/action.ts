// action.ts
"use server";

import { getServerAppAxio } from '@/lib/util/api';
import { QueriesSchema } from '@/lib/schema/data/query.schema';
import { ApiError } from '@/lib/errors/ApiError';
import axios from "axios";

export async function getHistory(access_token: string) {
  try {
    const api = getServerAppAxio();
    const response = await api.get('/queries', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    console.log(response.data);
    const data = QueriesSchema.parse(response.data);
    return data;
  } catch (error: any) {
    console.log(error);
  }
}