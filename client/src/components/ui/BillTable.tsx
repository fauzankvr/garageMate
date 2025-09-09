import type { TableRow } from "../../types/BillTable";

const data : TableRow[] = [
  { customer: "Ethan Harper", vehicle: "Toyota Camry", link: "#", date: "2024-07-15", cost: 250, status: "Paid" },
  { customer: "Olivia Bennett", vehicle: "Honda Civic", link: "#", date: "2024-07-10", cost: 180, status: "Pending" },
  { customer: "Noah Carter", vehicle: "Ford F-150", link: "#", date: "2024-07-05", cost: 300, status: "Paid" },
  { customer: "Ava Reynolds", vehicle: "Tesla Model 3", link: "#", date: "2024-06-28", cost: 220, status: "Paid" },
  { customer: "Liam Foster", vehicle: "Chevrolet Silverado", link: "#", date: "2024-06-20", cost: 280, status: "Pending" },
  { customer: "Liam Foster", vehicle: "Chevrolet Silverado", link: "#", date: "2024-06-20", cost: 280, status: "Pending" },
];

const statusClasses = {
  Paid: " text-green-600",
  Pending: " text-yellow-600"
};

const BillTable = () => {
  return (
    <div className="overflow-x-auto  rounded-lg border border-gray-200  ">
      <table className="w-full border-collapse text-left text-sm text-gray-600">
        <thead className="bg-gray-50 text-gray-700">
          <tr>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Vehicle</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Cost</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx} className="border-t   hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">{item.customer}</td>
              <td className="px-4 py-3 text-blue-600 hover:underline">
                <a href={item.link}>{item.vehicle}</a>
              </td>
              <td className="px-4 py-3">{item.date}</td>
              <td className="px-4 py-3">₹ {item.cost}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center   px-3 py-1 text-sm font-medium ${statusClasses[item.status]}`}>
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BillTable;

