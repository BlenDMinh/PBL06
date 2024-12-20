import create from 'zustand';
import { Plan } from '@/lib/schema/data/plan.schema';
import { fetchPlans } from './plan.action';

interface PlanState {
  plans: Plan[];
  fetchAllPlans: (access_token: string) => Promise<void>;
}

const usePlanStore = create<PlanState>((set) => ({
  plans: [],
  fetchAllPlans: async (access_token: string) => {
    try {
      const plans = await fetchPlans(access_token);
      set({ plans });
    } catch (error) {
      console.error('Failed to fetch plans', error);
    }
  },
}));

export default usePlanStore;