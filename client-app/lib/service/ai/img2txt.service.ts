import { Query, QuerySchema } from "@/lib/schema/data/query.schema";
import WrapperResponse from "@/lib/schema/wrapper.schema";

class Img2TxtService {
  async convertImageToText(image: any): Promise<Query | null> {
    const mockResponse = {
      message: "OK",
      data: {
        query: {
          id: 1,
          user_id: 1,
          image_id: 1,
          image: {
            id: 1,
            image_url: "",
            created_at: new Date(Date.now()).toISOString(),
          },
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
}

const img2txtService = new Img2TxtService();

export default img2txtService;
