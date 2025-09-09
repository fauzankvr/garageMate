import { useEffect, useState } from "react";
import Table from "../components/ui/Table"; // Adjust import path
import Sidebar from "../components/layout/Sidebar";
import UserActions from "../components/layout/headers/UserActions";

interface User {
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
}

const Employees = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Simulated fetch, replace with actual API later
    const fetchData = async () => {
      const data: User[] = [
        {
          name: "Ethan Carter",
          email: "ethan.carter@example.com",
          role: "Detailer",
          status: "Active",
        },
        {
          name: "Olivia Bennett",
          email: "olivia.bennett@example.com",
          role: "Detailer",
          status: "Active",
        },
        {
          name: "Noah Thompson",
          email: "noah.thompson@example.com",
          role: "Detailer",
          status: "Inactive",
        },
        {
          name: "Ava Harper",
          email: "ava.harper@example.com",
          role: "Detailer",
          status: "Active",
        },
        {
          name: "Liam Foster",
          email: "liam.foster@example.com",
          role: "Detailer",
          status: "Active",
        },
      ];

      setUsers(data);
    };

    fetchData();
  }, []);

  const headers = ["Name", "Email", "Role", "Status", "Actions"];

  const data = users.map((user) => [
    user.name,
    <span className="text-blue-600">{user.email}</span>,
    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
      {user.role}
    </span>,
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        user.status === "Active"
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      {user.status}
    </span>,
    <button className="text-blue-500 text-sm hover:underline">Edit</button>,
  ]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            Employees
          </h1>
          <UserActions />
        </div>
        <div className="w-full">
          <Table headers={headers} data={data} />
        </div>
      </div>
    </div>
  );
};

export default Employees;
