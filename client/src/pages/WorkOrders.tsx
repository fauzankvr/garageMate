import  { useEffect } from "react";

import Sidebar from "../components/layout/Sidebar";
import UserActions from "../components/layout/headers/UserActions";
import useOrder from "../hooks/useOrder";
import WorkOrderCreator from "../components/ui/CreateWorkOrder";
// import Table from "../components/ui/Table";
import WorkOrderTable from "./WorkOrderTable";

const WorkOrders = () => {


  const {  
    orders, 
headers,

fetchData}=useOrder()
  useEffect(() => {
    fetchData();
  }, []);

  const handleViewDetails = (item: any) => {
    alert(`View details for: ${item.serviceName}`);
  };

  const data = orders.map((item) => [
  item.serviceName,
  item.vehicleInfo,
  item.customerName,
  item.phone,
  item.totalCost,
  <span
    className={`px-3 py-1 rounded-full text-xs font-medium
      ${
        item.status === "Pending"
          ? "bg-yellow-100 text-yellow-700"
          : item.status === "Progress"
          ? "bg-blue-100 text-blue-700"
          : "bg-green-100 text-green-700"
      }`}
  >
    {item.status}
  </span>,
  <button
    onClick={() => handleViewDetails(item)} 
    className="text-blue-500 hover:underline"
  >
    View Details
  </button>
]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar for desktop */}
      <div className="hidden md:block w-50 bg-white border-r shadow">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col w-full md:w-auto p-4 sm:p-6 lg:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            Work Orders
          </h1>
          <UserActions />
        </div>

        {/* Table (responsive scroll for small screens) */}
        <div className="overflow-x-auto  bg-white shadow rounded-lg">
        <WorkOrderCreator/>
          {/* <Table className="" data={data} headers={headers} /> */}
          <WorkOrderTable/>
        </div>
      </div>
    </div>
  );
};

export default WorkOrders;
