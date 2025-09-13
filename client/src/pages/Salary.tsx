
import { useEffect, useState } from "react";
import Table from "../components/ui/Table"; // Adjust import path
import Sidebar from "../components/layout/Sidebar";
import UserActions from "../components/layout/headers/UserActions";
import instance from "../axios/axios";

interface Employee {
  _id: string;
  name: string;
  phone: string;
  email?: string;
}

interface Salary {
  _id: string;
  employee: Employee;
  month: string;
  baseSalary: number;
  bonus?: number;
  deduction?: number;
  borrowed?: number;
  paid: number;
  isPaid: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const Salaries = () => {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSalary, setCurrentSalary] = useState<Salary | null>(null);
  const [formData, setFormData] = useState<Partial<Salary>>({
    employee: { _id: "", name: "", phone: "" },
    month: "",
    baseSalary: 0,
    bonus: 0,
    deduction: 0,
    borrowed: 0,
    paid: 0,
    isPaid: false,
  });
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Fetch salaries and employees from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch salaries
        const salaryResponse = await instance.get("/api/salaries");
        setSalaries(salaryResponse.data);

        // Fetch employees for the dropdown
        const employeeResponse = await instance.get("/api/employee");
        setEmployees(employeeResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "employee") {
      const selectedEmployee = employees.find((emp) => emp._id === value);
      setFormData((prev) => ({
        ...prev,
        employee: selectedEmployee || { _id: "", name: "", phone: "" },
      }));
    } else if (name === "isPaid") {
      setFormData((prev) => ({ ...prev, isPaid: value === "true" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle adding a new salary
  const handleAddSalary = async () => {
    try {
      const payload = {
        employee: formData.employee?._id,
        month: formData.month,
        baseSalary: Number(formData.baseSalary),
        bonus: Number(formData.bonus) || 0,
        deduction: Number(formData.deduction) || 0,
        borrowed: Number(formData.borrowed) || 0,
        paid: Number(formData.paid) || 0,
        isPaid: formData.isPaid || false,
      };
      const response = await instance.post("/api/salaries", payload);
      if (response.status === 201) {
        const newSalary = response.data;
        setSalaries((prev) => [...prev, newSalary]);
        setFormData({
          employee: { _id: "", name: "", phone: "" },
          month: "",
          baseSalary: 0,
          bonus: 0,
          deduction: 0,
          borrowed: 0,
          paid: 0,
          isPaid: false,
        });
        setIsModalOpen(false);
      } else {
        console.error("Failed to add salary");
      }
    } catch (error) {
      console.error("Error adding salary:", error);
    }
  };

  // Handle editing a salary
  const handleEditSalary = async () => {
    if (!currentSalary?._id) return;
    try {
      const payload = {
        employee: formData.employee?._id,
        month: formData.month,
        baseSalary: Number(formData.baseSalary),
        bonus: Number(formData.bonus) || 0,
        deduction: Number(formData.deduction) || 0,
        borrowed: Number(formData.bonus) || 0,
        paid: Number(formData.paid) || 0,
        isPaid: formData.isPaid || false,
      };
      const response = await instance.put(`/api/salaries/${currentSalary._id}`, payload);
      if (response.status === 200) {
        const updatedSalary = response.data;
        setSalaries((prev) =>
          prev.map((sal) => (sal._id === updatedSalary._id ? updatedSalary : sal))
        );
        setFormData({
          employee: { _id: "", name: "", phone: "" },
          month: "",
          baseSalary: 0,
          bonus: 0,
          deduction: 0,
          borrowed: 0,
          paid: 0,
          isPaid: false,
        });
        setCurrentSalary(null);
        setIsModalOpen(false);
      } else {
        console.error("Failed to update salary");
      }
    } catch (error) {
      console.error("Error updating salary:", error);
    }
  };

  // Handle deleting a salary
  const handleDeleteSalary = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this salary record?")) return;
    try {
      const response = await instance.delete(`/api/salaries/${id}`);
      if (response.status === 200) {
        setSalaries((prev) => prev.filter((sal) => sal._id !== id));
      } else {
        console.error("Failed to delete salary");
      }
    } catch (error) {
      console.error("Error deleting salary:", error);
    }
  };

  // Open modal for adding or editing
  const openModal = (salary?: Salary) => {
    if (salary) {
      setCurrentSalary(salary);
      setFormData({
        employee: salary.employee,
        month: salary.month,
        baseSalary: salary.baseSalary,
        bonus: salary.bonus || 0,
        deduction: salary.deduction || 0,
        borrowed: salary.borrowed || 0,
        paid: salary.paid || 0,
        isPaid: salary.isPaid,
      });
    } else {
      setCurrentSalary(null);
      setFormData({
        employee: { _id: "", name: "", phone: "" },
        month: "",
        baseSalary: 0,
        bonus: 0,
        deduction: 0,
        borrowed: 0,
        paid: 0,
        isPaid: false,
      });
    }
    setIsModalOpen(true);
  };

  // Table headers
  const headers = [
    "Employee",
    "Month",
    "Base Salary",
    "Bonus",
    "Deduction",
    "Borrowed",
    "Paid",
    "Status",
    "Actions",
  ];

  // Table data
  const data = salaries.map((salary) => [
    salary.employee.name,
    salary.month,
    `$${salary.baseSalary.toFixed(2)}`,
    `$${salary.bonus?.toFixed(2) || "0.00"}`,
    `$${salary.deduction?.toFixed(2) || "0.00"}`,
    <span
      className={`${
        salary.borrowed && salary.borrowed > 0
          ? "text-red-600 font-medium"
          : "text-gray-600"
      }`}
    >
      ${salary.borrowed?.toFixed(2) || "0.00"}
    </span>,
    `$${salary.paid.toFixed(2)}`,
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        salary.isPaid
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {salary.isPaid ? "Paid" : "Unpaid"}
    </span>,
    <div className="flex space-x-2">
      <button
        className="text-blue-500 text-sm hover:underline"
        onClick={() => openModal(salary)}
      >
        Edit
      </button>
      <button
        className="text-red-500 text-sm hover:underline"
        onClick={() => handleDeleteSalary(salary._id)}
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
            Salary Management
          </h1>
          <div className="flex space-x-2">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              onClick={() => openModal()}
            >
              Add Salary
            </button>
            <UserActions />
          </div>
        </div>
        <div className="w-full">
          <Table headers={headers} data={data} />
        </div>
      </div>

      {/* Modal for Add/Edit Salary */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {currentSalary ? "Edit Salary" : "Add Salary"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Employee
                </label>
                <select
                  name="employee"
                  value={formData.employee?._id || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  required
                >
                  <option value="" disabled>
                    Select an employee
                  </option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.phone})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Month (YYYY-MM)
                </label>
                <input
                  type="text"
                  name="month"
                  value={formData.month}
                  onChange={handleInputChange}
                  placeholder="e.g., 2025-09"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Base Salary
                </label>
                <input
                  type="number"
                  name="baseSalary"
                  value={formData.baseSalary}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bonus (optional)
                </label>
                <input
                  type="number"
                  name="bonus"
                  value={formData.bonus}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Deduction (optional)
                </label>
                <input
                  type="number"
                  name="deduction"
                  value={formData.deduction}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Borrowed (optional)
                </label>
                <input
                  type="number"
                  name="borrowed"
                  value={formData.borrowed}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Paid Amount
                </label>
                <input
                  type="number"
                  name="paid"
                  value={formData.paid}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  name="isPaid"
                  value={formData.isPaid ? "true" : "false"}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                >
                  <option value="true">Paid</option>
                  <option value="false">Unpaid</option>
                </select>
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
                onClick={currentSalary ? handleEditSalary : handleAddSalary}
              >
                {currentSalary ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Salaries;
