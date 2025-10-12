import { useState, useRef } from "react";
import { Plus, X } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import UserActions from "../components/layout/headers/UserActions";
import WorkOrderForm from "../components/ui/CreateWorkOrder";
import WorkOrderTable from "./WorkOrderTable";

const WorkOrders = () => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const workOrderTableRef = useRef<{ refresh: () => void } | null>(null);

  const handleCreateWorkOrder = () => {
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    workOrderTableRef.current?.refresh(); // Refresh table after creating new bill
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <div className="hidden md:block bg-white shadow-sm">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col w-full md:w-auto p-4 sm:p-6 lg:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            Past Bills
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handleCreateWorkOrder}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={20} />
              Create New Bill
            </button>
            <UserActions />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <WorkOrderTable
            ref={workOrderTableRef}
            onRefresh={() => {
              console.log("Table refreshed from WorkOrders");
            }}
          />
        </div>

        {/* Create Work Order Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium"></h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <WorkOrderForm onSave={handleCloseModal} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkOrders;
