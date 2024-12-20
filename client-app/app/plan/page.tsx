"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthenticateStore from '@/lib/store/authenticate.store';
import { changeSubscription } from '@/app/plan/action';
import usePlanStore from '@/lib/store/plan.store';
import Loader from '@/components/layout/loader';
import { toast } from "react-toastify";

const PlanPage = () => {
  const { isAuthenticated, ensuredInitialized, subscription, user, setSubscription } = useAuthenticateStore();
  const { plans, fetchAllPlans } = usePlanStore();
  const router = useRouter();
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    ensuredInitialized().then(() => {
      const access_token = localStorage.getItem('access_token');
      if (access_token && plans.length === 0) {
        fetchAllPlans(access_token);
      }
    });
  }, [ensuredInitialized, fetchAllPlans, plans.length]);

  const handleSubscribe = async (planId: number) => {
    setSubscribing(true);
    const access_token = localStorage.getItem('access_token');

    if (!access_token || !user?.id) {
      toast.error('Please log in to subscribe');
      setSubscribing(false);
      return;
    }

    const success = await changeSubscription(user.id, planId, subscription!.id, access_token);

    if (success) {
      toast.success('Subscription changed successfully');
      setSubscription({ ...subscription!, plan_id: planId });
      router.refresh();
    } else {
      toast.error('Failed to change subscription');
    }
    setSubscribing(false);
  };

  if (plans.length === 0) return <Loader />;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-12 text-center">Choose Your Plan</h1>
      <div className="flex flex-col md:flex-row justify-center items-center gap-8">
        {plans.map((plan) => {
          const isCurrentPlan = subscription?.plan_id === plan.id;

          return (
            <div key={plan.id} className="rounded-2xl w-80 bg-base-100 shadow-xl border border-primary">
              <div className="card-body">
                <h2 className="card-title text-center text-2xl font-bold">{plan.name}</h2>
                <p className="text-center text-5xl font-extrabold my-4">
                  ${plan.price}
                  <span className="text-lg font-normal">/mo</span>
                </p>
                <ul className="mb-6">
                  <li className="text-center">Monthly Tokens: {plan.monthy_token}</li>
                  <li className="text-center">Daily Tokens: {plan.daily_token}</li>
                </ul>
                <div className="card-actions justify-center">
                  {isAuthenticated ? (
                    isCurrentPlan ? (
                      <button className="btn btn-secondary w-full" disabled>
                        Current Plan
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary w-full"
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={subscribing}
                      >
                        {subscribing ? 'Subscribing...' : 'Subscribe'}
                      </button>
                    )
                  ) : (
                    <button className="btn btn-primary w-full" disabled>
                      Log in to Subscribe
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlanPage;