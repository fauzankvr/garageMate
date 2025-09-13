import { useEffect, useState } from "react";
import Table from "../components/ui/Table"; // Adjust import path
import Sidebar from "../components/layout/Sidebar";
import UserActions from "../components/layout/headers/UserActions";
import instance from "../axios/axios";

interface Employee {
  _id?: string;
  name: string;
  phone: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: "",
    phone: "",
    email: "",
  });

  // Fetch employees from API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await instance.get("/api/employee");
        const data = response.data;
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle adding a new employee
  const handleAddEmployee = async () => {
    try {
      const response = await instance.post("/api/employee", formData);
      if (response.status === 201) {
        const newEmployee = response.data;
        setEmployees((prev) => [...prev, newEmployee]);
        setFormData({ name: "", phone: "", email: "" });
        setIsModalOpen(false);
      } else {
        console.error("Failed to add employee");
      }
    } catch (error) {
      console.error("Error adding employee:", error);
    }
  };

  // Handle editing an employee
  const handleEditEmployee = async () => {
    if (!currentEmployee?._id) return;
    try {
      const response = await instance.put(`/api/employee/${currentEmployee._id}`, formData);
      if (response.status === 200) {
        const updatedEmployee = response.data;
        setEmployees((prev) =>
          prev.map((emp) =>
            emp._id === updatedEmployee._id ? updatedEmployee : emp
          )
        );
        setFormData({ name: "", phone: "", email: "" });
        setCurrentEmployee(null);
        setIsModalOpen(false);
      } else {
        console.error("Failed to update employee");
      }
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };

  // Handle deleting an employee
  const handleDeleteEmployee = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      const response = await instance.delete(`/api/employee/${id}`);
      if (response.status === 200) {
        setEmployees((prev) => prev.filter((emp) => emp._id !== id));
      } else {
        console.error("Failed to delete employee");
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  // Open modal for adding or editing
  const openModal = (employee?: Employee) => {
    if (employee) {
      setCurrentEmployee(employee);
      setFormData({
        name: employee.name,
        phone: employee.phone,
        email: employee.email || "",
      });
    } else {
      setCurrentEmployee(null);
      setFormData({ name: "", phone: "", email: "" });
    }
    setIsModalOpen(true);
  };

  // Table headers
  const headers = ["Name", "Phone", "Email", "Status", "Actions"];

  // Table data
  const data = employees.map((employee) => [
    employee.name,
    employee.phone,
    <span className="text-blue-600">{employee.email || "N/A"}</span>,
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        employee.updatedAt
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      {employee.updatedAt ? "Active" : "Inactive"}
    </span>,
    <div className="flex space-x-2">
      <button
        className="text-blue-500 text-sm hover:underline"
        onClick={() => openModal(employee)}
      >
        Edit
      </button>
      <button
        className="text-red-500 text-sm hover:underline"
        onClick={() => handleDeleteEmployee(employee._id!)}
      >
        Delete
      </button>
    </div>,
  ]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            Employees
          </h1>
          <div className="flex space-x-2">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              onClick={() => openModal()}
            >
              Add Employee
            </button>
            <UserActions />
          </div>
        </div>
        <div className="w-full">
          <Table headers={headers} data={data} />
        </div>
      </div>

      {/* Modal for Add/Edit Employee */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {currentEmployee ? "Edit Employee" : "Add Employee"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email (optional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                onClick={currentEmployee ? handleEditEmployee : handleAddEmployee}
              >
                {currentEmployee ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
