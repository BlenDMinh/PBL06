"use client";

import React, { useEffect, useState } from "react";
import useAuthenticateStore from "@/lib/store/authenticate.store";
import usePlanStore from '@/lib/store/plan.store';
import Link from "next/link";
import { Menu01Icon } from "hugeicons-react";
import { handleLogout } from "@/app/actions";
import SidebarItem from "@/components/layout/sidebar_item";
import Loader from "@/components/layout/loader";
import UserModal from "@/components/modals/user_modal";
import { User } from "@/lib/schema/data/user.schema";
import { Subscription } from "@/lib/schema/data/subscription";
import { toast } from "react-toastify";

const Sidebar = () => {
  const {
    isAuthenticated,
    ensuredInitialized,
    subscription: authSubscription,
    user: authUser,
    setIsAuthenticated,
    setUser: setAuthUser,
    setSubscription: setAuthSubscription,
  } = useAuthenticateStore();

  const { fetchAllPlans, plans } = usePlanStore();
  const [user, setUser] = useState<User | null | undefined>(authUser);
  const [userSubscription, setUserSubscription] = useState<Subscription | null | undefined>(authSubscription);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    ensuredInitialized().then(() => {
      const access_token = localStorage.getItem('access_token');
      if (access_token) {
        fetchAllPlans(access_token);
      }
      setUser(authUser);
      setUserSubscription(authSubscription);
    });
  }, [authUser, authSubscription, isAuthenticated]);

  if (isAuthenticated === undefined) {
    return <Loader />;
  }

  const handleLogoutClick = () => {
    handleLogout();
    setIsAuthenticated(false);
    setAuthUser(null);
    setAuthSubscription(null);
    setIsMobileMenuOpen(false);
    toast.success('Logged out successfully');
  };

  const sidebarContent = (
    <>
      <Link href="/" className="font-bold text-secondary-content text-2xl mb-8">
        Logo
      </Link>
      <div className="flex flex-col justify-center grow items-start px-8 w-full">
        {isAuthenticated && (
          <SidebarItem href="/history" icon={<Menu01Icon size={32} />} active={false}>
            History
          </SidebarItem>
        )}
      </div>
      <div className="w-full mt-auto px-8">
        {isAuthenticated ? (
          <div className="flex flex-col h-full items-start gap-1 text-white">
            <div className="flex items-center gap-2">
              <span className="text-base-content cursor-pointer text-sm flex items-center" onClick={() => setIsModalOpen(true)}>
                Hello, <span className="font-bold text-primary ml-1">{user?.username}</span>
              </span>
              <Link href="/plan">
                {userSubscription && (
                  <span className="px-1.5 py-0.5 rounded bg-primary text-primary-content text-xs font-bold truncate">
                    {plans.find(p => p.id === userSubscription.plan_id)?.name || 'Loading...'}
                  </span>
                )}
              </Link>
            </div>
            <button
              className="btn btn-outline w-full mt-4"
              onClick={handleLogoutClick}
            >
              Logout
            </button>
          </div>
        ) : (
          <Link href="/auth/login" className="btn btn-outline w-full">
            Login
          </Link>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="md:hidden fixed top-4 right-4 z-50 btn btn-circle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu01Icon />
      </button>

      {/* Mobile Sidebar */}
      <div className={`md:hidden fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-40 w-64 bg-base-300 flex flex-col items-center justify-between py-8`}>
        {sidebarContent}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex sticky w-64 bg-base-300 flex-col items-center justify-between py-8 h-screen">
        {sidebarContent}
      </div>

      {/* User Modal */}
      <UserModal 
        user={user} 
        subscription={plans.find(p => p.id === userSubscription?.plan_id)?.name} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;