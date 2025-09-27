import React from "react";
import Sidebar from "../layout/Sidebar";

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="hidden md:block bg-white">
        <Sidebar />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-600">
            Loading Dashboard...
          </h2>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
