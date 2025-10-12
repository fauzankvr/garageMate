import { useEffect, useState } from "react";
import Table from "../components/ui/Table"; // Adjust import path
import Sidebar from "../components/layout/Sidebar";
import UserActions from "../components/layout/headers/UserActions";
import instance from "../axios/axios";
import { X } from "lucide-react";

interface Employee {
  _id?: string;
  name: string;
  phone: string;
  baseSalary: string;
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
    baseSalary: "",
  });
  const [searchQuery, setSearchQuery] = useState<string>(""); // State for search query

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
        setFormData({ name: "", phone: "", baseSalary: "" });
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
      const response = await instance.put(
        `/api/employee/${currentEmployee._id}`,
        formData
      );
      if (response.status === 200) {
        const updatedEmployee = response.data;
        setEmployees((prev) =>
          prev.map((emp) =>
            emp._id === updatedEmployee._id ? updatedEmployee : emp
          )
        );
        setFormData({ name: "", phone: "", baseSalary: "" });
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
    if (!window.confirm("Are you sure you want to delete this employee?"))
      return;
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
        baseSalary: employee.baseSalary,
      });
    } else {
      setCurrentEmployee(null);
      setFormData({ name: "", phone: "", baseSalary: "" });
    }
    setIsModalOpen(true);
  };

  // Table headers
  const headers = ["Name", "Salary", "Phone", "Status", "Actions"];

  // Filter employees based on search query
  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Table data
  const data = filteredEmployees.map((employee) => [
    employee.name,
    <span className="text-blue-600">{employee.baseSalary || "N/A"}</span>,
    employee.phone,
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
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <div>
             
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter employee name..."
                className="block w-full sm:w-64 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200"
              />
            </div>
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
        </div>
        <div className="w-full">
          <Table headers={headers} data={data} />
        </div>
      </div>

      {/* Modal for Add/Edit Employee */}
      {isModalOpen && (
        <div
          className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300"
          role="dialog"
          aria-labelledby="modal-title"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-6">
              <h2 id="modal-title" className="text-2xl font-bold text-gray-800">
                {currentEmployee ? "Edit Employee" : "Add Employee"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                currentEmployee ? handleEditEmployee() : handleAddEmployee();
              }}
              className="space-y-6"
            >
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter employee name"
                  required
                  aria-required="true"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter phone number"
                  required
                  aria-required="true"
                />
              </div>
              <div>
                <label
                  htmlFor="baseSalary"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Base Salary <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="baseSalary"
                  name="baseSalary"
                  value={formData.baseSalary}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter base salary"
                  required
                  aria-required="true"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  {currentEmployee ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
