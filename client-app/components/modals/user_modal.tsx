import React, { useState } from "react";
import { User } from "@/lib/schema/data/user.schema";
import { UserIcon, Settings01Icon } from "hugeicons-react";
import { Subscription } from "@/lib/schema/data/subscription";
import Link from "next/link";

interface UserModalProps {
  user: User | null | undefined;
  subscription: string | null | undefined;
  isOpen: boolean;
  onClose: () => void;
}
const UserModal: React.FC<UserModalProps> = ({ user, subscription, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("info");

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="modal modal-open">
        <div className="modal-box flex">
          <div className="flex flex-col border-r pr-4">
            <button
              className={`flex items-center gap-2 p-2 mb-2 ${activeTab === "info" ? "border-l-4 border-primary" : ""}`}
              onClick={() => setActiveTab("info")}
            >
              <UserIcon size={20} />
              User Info
            </button>
            <button
              className={`flex items-center gap-2 p-2 ${activeTab === "settings" ? "border-l-4 border-primary" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              <Settings01Icon size={20} />
              Settings
            </button>
          </div>
          <div className="flex-1 pl-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">User Information</h2>
              <button className="btn btn-sm btn-circle btn-outline" onClick={onClose}>
                ✕
              </button>
            </div>
            {activeTab === "info" && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="font-semibold">Email:</label>
                  <p>{user.email}</p>
                </div>
                <div>
                  <label className="font-semibold">Username:</label>
                  <p>{user.username}</p>
                </div>
                <div>
                  <label className="font-semibold">Current subscription:</label>
                  <div className="flex items-center gap-2">
                    <p>{subscription}</p>
                    <Link href="/plan">
                      <p className="text-primary underline">(Change Plan)</p>
                    </Link>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "settings" && (
              <div className="flex flex-col gap-4">
                <p>Settings content goes here...</p>
              </div>
            )}
            <div className="modal-action">
              <button className="btn" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserModal;