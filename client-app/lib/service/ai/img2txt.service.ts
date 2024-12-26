import { getAIServerAxio } from "@/lib/util/api";
import { Query, QuerySchema } from "@/lib/schema/data/query.schema";
import WrapperResponse from "@/lib/schema/wrapper.schema";

class Img2TxtService {
  async convertImageToText(image: File): Promise<Query | null> {
    try {
      const aiServer = getAIServerAxio();
      const formData = new FormData();
      formData.append("upload_image", image);

      const response = await aiServer.post("/img2txt", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const wrapper = WrapperResponse.parse(response.data);
      if (wrapper.data) {
        const query = QuerySchema.parse(wrapper.data.query);
        return query;
      }

      return null;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}

const img2txtService = new Img2TxtService();

export default img2txtService;