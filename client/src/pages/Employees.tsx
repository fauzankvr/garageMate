import { useEffect, useState } from "react";
import Table from "../components/ui/Table";
import Sidebar from "../components/layout/Sidebar";
import UserActions from "../components/layout/headers/UserActions";
import instance from "../axios/axios";
import { X } from "lucide-react";
import { usePasswordVerification } from "../hooks/usePasswordVerification";

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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Initialize the password verification hook
  const { PasswordModal, openPasswordModal, closePasswordModal } =
    usePasswordVerification();

  // Fetch employees from API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await instance.get("/api/employee");
        const data = response.data;
        setEmployees(data);
        setError(null);
      } catch (error: any) {
        console.error("Error fetching employees:", error);
        setError(
          error.response?.data?.message ||
            "Error fetching employees. Please try again."
        );
      }
    };
    fetchEmployees();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  // Handle adding a new employee - NO PASSWORD REQUIRED
  const handleAddEmployee = async () => {
    if (!formData.name || !formData.phone || !formData.baseSalary) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      const response = await instance.post("/api/employee", formData);
      if (response.status === 201) {
        const newEmployee = response.data;
        setEmployees((prev) => [...prev, newEmployee]);
        setFormData({ name: "", phone: "", baseSalary: "" });
        setIsModalOpen(false);
        setError(null);
      } else {
        setError("Failed to add employee.");
      }
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Error adding employee. Please try again."
      );
    }
  };

  // Handle editing an employee - REQUIRES PASSWORD VERIFICATION
  const handleEditEmployee = () => {
    if (!currentEmployee?._id) {
      setError("No employee selected.");
      return;
    }

    // Open password modal for edit operation
    openPasswordModal(async () => {
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
          setError(null);
          closePasswordModal();
        } else {
          setError("Failed to update employee.");
        }
      } catch (error: any) {
        setError(
          error.response?.data?.message ||
            "Error updating employee. Please try again."
        );
      }
    });
  };

  // Handle deleting an employee - REQUIRES PASSWORD VERIFICATION
  const onDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    openPasswordModal(async () => {
      try {
        const response = await instance.delete(`/api/employee/${id}`);
        if (response.status === 200) {
          setEmployees((prev) => prev.filter((emp) => emp._id !== id));
          setError(null);
          closePasswordModal();
        } else {
          setError("Failed to delete employee.");
        }
      } catch (error: any) {
        setError(
          error.response?.data?.message ||
            "Error deleting employee. Please try again."
        );
      }
    });
  };

  // Open modal for adding (NO PASSWORD) or editing (WITH PASSWORD)
  const openModal = (employee?: Employee) => {
    if (employee) {
      // EDIT - Requires password verification
      openPasswordModal(() => {
        setCurrentEmployee(employee);
        setFormData({
          name: employee.name,
          phone: employee.phone,
          baseSalary: employee.baseSalary,
        });
        setIsModalOpen(true);
        setError(null);
        closePasswordModal();
      });
    } else {
      // ADD - No password required, open modal directly
      setCurrentEmployee(null);
      setFormData({ name: "", phone: "", baseSalary: "" });
      setIsModalOpen(true);
      setError(null);
    }
  };

  // Close modal and reset form
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentEmployee(null);
    setFormData({ name: "", phone: "", baseSalary: "" });
    setError(null);
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
    <span key={`salary-${employee._id}`} className="text-blue-600">
      ₹{employee.baseSalary || "N/A"}
    </span>,
    employee.phone,
    <span
      key={`status-${employee._id}`}
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        employee.updatedAt
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      {employee.updatedAt ? "Active" : "Inactive"}
    </span>,
    <div key={`actions-${employee._id}`} className="flex space-x-2">
      <button
        className="text-blue-500 text-sm hover:underline"
        onClick={() => openModal(employee)}
        title="Edit employee (requires password)"
      >
        Edit
      </button>
      <button
        className="text-red-500 text-sm hover:underline"
        onClick={() => onDelete(employee._id!)}
        title="Delete employee (requires password)"
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
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                onClick={() => openModal()} // ADD - No password required
              >
                Add Employee
              </button>
              <UserActions />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg text-sm border-l-4 border-red-500">
            {error}
          </div>
        )}

        {filteredEmployees.length === 0 && (
          <div className="p-4 text-center text-gray-500 bg-white rounded-lg shadow">
            {searchQuery
              ? `No employees found for "${searchQuery}".`
              : "No employees available. Add your first employee!"}
          </div>
        )}

        {filteredEmployees.length > 0 && (
          <div className="w-full bg-white rounded-lg shadow overflow-hidden">
            <Table headers={headers} data={data} />
          </div>
        )}

        {/* Render Password Modal - Only appears for Edit/Delete */}
        <PasswordModal />

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
                <h2
                  id="modal-title"
                  className="text-2xl font-bold text-gray-800"
                >
                  {currentEmployee ? "Edit Employee" : "Add Employee"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm border-l-4 border-red-500">
                  {error}
                </div>
              )}

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
                    type="tel"
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
                    type="number"
                    id="baseSalary"
                    name="baseSalary"
                    value={formData.baseSalary}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter base salary"
                    required
                    aria-required="true"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-lg text-white font-medium focus:outline-none focus:ring-2 transition-colors duration-200 ${
                      currentEmployee
                        ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                        : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                    }`}
                    disabled={
                      !formData.name || !formData.phone || !formData.baseSalary
                    }
                  >
                    {currentEmployee
                      ? "Update Employee (Requires Password)"
                      : "Add Employee"}
                  </button>
                </div>
              </form>

              {/* Visual indicator for edit operations */}
              {currentEmployee && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                  <svg
                    className="w-4 h-4 inline mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Password verification required to update employee information.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Employees;
