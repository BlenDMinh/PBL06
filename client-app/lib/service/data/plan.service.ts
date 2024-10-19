import { Plan, PlansSchema } from "@/lib/schema/data/plan.schema";
import WrapperResponse from "@/lib/schema/wrapper.schema";

class PlanService {
  async getAll(): Promise<Plan[]> {
    const mockResponse = {
      message: "OK",
      data: {
        plans: [
          {
            id: 1,
            name: "Basic",
            monthy_token: 0,
            daily_token: 10,
            price: 0,
          },
        ],
      },
    };

    const response = WrapperResponse.parse(mockResponse);
    if (response.data) {
      try {
        const plans = PlansSchema.parse(response.data.plans);
        return plans;
      } catch (e) {
        console.log(e);
        return [];
      }
    }

    return [];
  }
}

const planService = new PlanService();

export default planService;
