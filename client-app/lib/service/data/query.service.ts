import {
  QueriesSchema,
  Query,
  QuerySchema,
} from "@/lib/schema/data/query.schema";
import WrapperResponse from "@/lib/schema/wrapper.schema";

class QueryService {
  async getByid(id: number): Promise<null | Query> {
    const mockResponse = {
      message: "OK",
      data: {
        query: {
          id: id,
          user_id: 1,
          image_id: 1,
          result: "API_SUCCESS",
          content: "A null image",
          used_token: 1,
          created_at: new Date(Date.now()).toISOString(),
        },
      },
    };

    const response = WrapperResponse.parse(mockResponse);
    if (response.data) {
      try {
        const query = QuerySchema.parse(response.data.query);
        return query;
      } catch (e) {
        console.log(e);
        return null;
      }
    }
    return null;
  }

  async getByUserId(userId: number): Promise<Query[]> {
    const mockResponse = {
      message: "OK",
      data: {
        queries: [
          {
            id: 1,
            user_id: 1,
            image_id: 1,
            result: "API_SUCCESS",
            content: "A null image",
            used_token: 1,
            created_at: new Date(Date.now()).toISOString(),
          },
        ],
      },
    };
    const response = WrapperResponse.parse(mockResponse);
    if (response.data) {
      try {
        const queries = QueriesSchema.parse(response.data.queries);
        return queries;
      } catch (e) {
        console.log(e);
        return [];
      }
    }

    return [];
  }
}

const queryService = new QueryService();

export default queryService;
