import React from "react";
import { Calendar } from "lucide-react";
import UserActions from "../layout/headers/UserActions";

const DashboardHeader: React.FC = () => {
  return (
    <div className="bg-white border-b shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex space-x-2">
          <UserActions />
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
