import React from "react";

interface TableProps {
  data: {
    serviceName: string;
    vehicleInfo: string;
    customerName: string;
    phone: string;
    totalCost: number;
    status: "Pending" | "Progress" | "Completed";
  }[];
  onViewDetails: (item: any) => void;
}

const statusStyles: Record<string, string> = {
  Pending: "bg-gray-200 text-gray-800",
  Progress: "bg-blue-200 text-blue-800",
  Completed: "bg-green-200 text-green-800",
};

const OrderTable: React.FC<TableProps> = ({ data, onViewDetails }) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-100 text-gray-600 uppercase text-left">
          <tr>
            <th className="px-4 py-3">Service Name</th>
            <th className="px-4 py-3">Vehicle Info</th>
            <th className="px-4 py-3">Customer Name</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Total Cost</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-3">{item.serviceName}</td>
              <td className="px-4 py-3 text-blue-600 underline cursor-pointer">
                {item.vehicleInfo}
              </td>
              <td className="px-4 py-3">{item.customerName}</td>
              <td className="px-4 py-3">{item.phone}</td>
              <td className="px-4 py-3">{item.totalCost.toLocaleString()} ₹</td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[item.status]}`}
                >
                  {item.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onViewDetails(item)}
                  className="text-blue-600 hover:underline"
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
