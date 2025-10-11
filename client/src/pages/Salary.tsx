import { useEffect, useState } from "react";
import Table from "../components/ui/Table";
import Sidebar from "../components/layout/Sidebar";
import UserActions from "../components/layout/headers/UserActions";
import instance from "../axios/axios";

interface Employee {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  baseSalary: number;
}

interface BorrowedEntry {
  date: string;
  amount: number;
}

interface Salary {
  _id: string;
  employee: Employee;
  date: string;
  baseSalary: number;
  bonus?: number;
  deduction?: number;
  borrowed: number;
  borrowedHistory: BorrowedEntry[];
  due: number;
  createdAt?: string;
  updatedAt?: string;
}

interface FormData extends Partial<Salary> {
  newBorrowDate?: string;
  newBorrowAmount?: number;
}

const Salaries = () => {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSalary, setCurrentSalary] = useState<Salary | null>(null);
  const [formData, setFormData] = useState<FormData>({
    employee: { _id: "", name: "", phone: "", baseSalary: 0 },
    date: "",
    baseSalary: 0,
    bonus: 0,
    deduction: 0,
    borrowed: 0,
    borrowedHistory: [],
    due: 0,
    newBorrowDate: "",
    newBorrowAmount: 0,
  });
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Fetch salaries and employees from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const salaryResponse = await instance.get("/api/salaries");
        setSalaries(salaryResponse.data);
        const employeeResponse = await instance.get("/api/employee");
        setEmployees(employeeResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Find the most recent salary record for an employee
  const getPreviousSalary = (employeeId: string): Salary | null => {
    const employeeSalaries = salaries
      .filter((sal) => sal.employee._id === employeeId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return employeeSalaries.length > 0 ? employeeSalaries[0] : null;
  };

  // Calculate due amount
  const calculateDue = (
    employeeId: string,
    baseSalary: number,
    bonus: number,
    deduction: number,
    borrowed: number,
    newDate: string
  ): number => {
    const prevSalary = getPreviousSalary(employeeId);
    if (!prevSalary) {
      return baseSalary + (bonus || 0) - (deduction || 0) - (borrowed || 0);
    }
    const newDateObj = new Date(newDate);
    const prevDateObj = new Date(prevSalary.date);
    const isSameMonth =
      newDateObj.getFullYear() === prevDateObj.getFullYear() &&
      newDateObj.getMonth() === prevDateObj.getMonth();
    return isSameMonth
      ? (prevSalary.due || 0) - (borrowed || 0)
      : baseSalary + (bonus || 0) - (deduction || 0) - (borrowed || 0);
  };

  // Calculate borrowed from borrowedHistory
  const calculateBorrowed = (borrowedHistory: BorrowedEntry[]): number => {
    return borrowedHistory.reduce((sum, entry) => sum + (entry.amount || 0), 0);
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "employee") {
      const selectedEmployee = employees.find((emp) => emp._id === value);
      setFormData((prev) => ({
        ...prev,
        employee: selectedEmployee || {
          _id: "",
          name: "",
          phone: "",
          baseSalary: 0,
        },
        baseSalary: selectedEmployee?.baseSalary || 0,
        due: calculateDue(
          selectedEmployee?._id || "",
          selectedEmployee?.baseSalary || 0,
          prev.bonus || 0,
          prev.deduction || 0,
          calculateBorrowed(prev.borrowedHistory || []),
          prev.date || ""
        ),
      }));
    } else {
      setFormData((prev) => {
        const newFormData = {
          ...prev,
          [name]: name === "newBorrowAmount" ? Number(value) : value,
        };
        const borrowed = calculateBorrowed(newFormData.borrowedHistory || []);
        return {
          ...newFormData,
          borrowed,
          due: calculateDue(
            prev.employee?._id || "",
            prev.baseSalary || 0,
            name === "bonus" ? Number(value) : prev.bonus || 0,
            name === "deduction" ? Number(value) : prev.deduction || 0,
            borrowed,
            name === "date" ? value : prev.date || ""
          ),
        };
      });
    }
  };

  // Add a new borrow entry
  const addBorrowEntry = () => {
    if (!formData.newBorrowDate || !formData.newBorrowAmount) {
      alert("Please provide both borrow date and amount.");
      return;
    }
    const newEntry: BorrowedEntry = {
      date: formData.newBorrowDate,
      amount: formData.newBorrowAmount,
    };
    setFormData((prev) => {
      const newHistory = [...(prev.borrowedHistory || []), newEntry];
      const borrowed = calculateBorrowed(newHistory);
      return {
        ...prev,
        borrowedHistory: newHistory,
        borrowed,
        due: calculateDue(
          prev.employee?._id || "",
          prev.baseSalary || 0,
          prev.bonus || 0,
          prev.deduction || 0,
          borrowed,
          prev.date || ""
        ),
        newBorrowDate: "",
        newBorrowAmount: 0,
      };
    });
  };

  // Remove a borrow entry
  const removeBorrowEntry = (index: number) => {
    setFormData((prev) => {
      const newHistory = (prev.borrowedHistory || []).filter(
        (_, i) => i !== index
      );
      const borrowed = calculateBorrowed(newHistory);
      return {
        ...prev,
        borrowedHistory: newHistory,
        borrowed,
        due: calculateDue(
          prev.employee?._id || "",
          prev.baseSalary || 0,
          prev.bonus || 0,
          prev.deduction || 0,
          borrowed,
          prev.date || ""
        ),
      };
    });
  };

  // Handle adding a new salary
  const handleAddSalary = async () => {
    try {
      const payload = {
        employee: formData.employee?._id,
        date: formData.date,
        baseSalary: Number(formData.baseSalary),
        bonus: Number(formData.bonus) || 0,
        deduction: Number(formData.deduction) || 0,
        borrowed: Number(formData.borrowed) || 0,
        borrowedHistory: formData.borrowedHistory || [],
        due: Number(formData.due) || 0,
      };
      const response = await instance.post("/api/salaries", payload);
      if (response.status === 201) {
        const newSalary = response.data;
        setSalaries((prev) => [...prev, newSalary]);
        setFormData({
          employee: { _id: "", name: "", phone: "", baseSalary: 0 },
          date: "",
          baseSalary: 0,
          bonus: 0,
          deduction: 0,
          borrowed: 0,
          borrowedHistory: [],
          due: 0,
          newBorrowDate: "",
          newBorrowAmount: 0,
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
        date: formData.date,
        baseSalary: Number(formData.baseSalary),
        bonus: Number(formData.bonus) || 0,
        deduction: Number(formData.deduction) || 0,
        borrowed: Number(formData.borrowed) || 0,
        borrowedHistory: formData.borrowedHistory || [],
        due: Number(formData.due) || 0,
      };
      const response = await instance.put(
        `/api/salaries/${currentSalary._id}`,
        payload
      );
      if (response.status === 200) {
        const updatedSalary = response.data;
        setSalaries((prev) =>
          prev.map((sal) =>
            sal._id === updatedSalary._id ? updatedSalary : sal
          )
        );
        setFormData({
          employee: { _id: "", name: "", phone: "", baseSalary: 0 },
          date: "",
          baseSalary: 0,
          bonus: 0,
          deduction: 0,
          borrowed: 0,
          borrowedHistory: [],
          due: 0,
          newBorrowDate: "",
          newBorrowAmount: 0,
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

  // Handle adding a borrow entry via button
  const handleAddBorrow = (salary: Salary) => {
    setCurrentSalary(salary);
    setFormData({
      employee: salary.employee,
      date: salary.date,
      baseSalary: salary.baseSalary,
      bonus: salary.bonus || 0,
      deduction: salary.deduction || 0,
      borrowed: salary.borrowed || 0,
      borrowedHistory: salary.borrowedHistory || [],
      due: salary.due || 0,
      newBorrowDate: "",
      newBorrowAmount: 0,
    });
    setIsModalOpen(true);
  };

  // Handle deleting a salary
  const handleDeleteSalary = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this salary record?"))
      return;
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
        date: salary.date,
        baseSalary: salary.baseSalary,
        bonus: salary.bonus || 0,
        deduction: salary.deduction || 0,
        borrowed: salary.borrowed || 0,
        borrowedHistory: salary.borrowedHistory || [],
        due: salary.due || 0,
        newBorrowDate: "",
        newBorrowAmount: 0,
      });
    } else {
      setCurrentSalary(null);
      setFormData({
        employee: { _id: "", name: "", phone: "", baseSalary: 0 },
        date: "",
        baseSalary: 0,
        bonus: 0,
        deduction: 0,
        borrowed: 0,
        borrowedHistory: [],
        due: 0,
        newBorrowDate: "",
        newBorrowAmount: 0,
      });
    }
    setIsModalOpen(true);
  };

  // Table headers
  const headers = [
    "Employee",
    "Date",
    "Base Salary",
    "Bonus",
    "Deduction",
    "Borrowed",
    "Due",
    "Actions",
  ];

  // Table data
  const data = salaries.map((salary) => [
    salary.employee.name,
    new Date(salary.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    `₹${salary.baseSalary.toFixed(2)}`,
    `₹${salary.bonus?.toFixed(2) || "0.00"}`,
    `₹${salary.deduction?.toFixed(2) || "0.00"}`,
    <span
      className={`${
        salary.borrowed && salary.borrowed > 0
          ? "text-red-600 font-medium"
          : "text-gray-600"
      }`}
    >
      ₹{salary.borrowed?.toFixed(2) || "0.00"}
    </span>,
    `₹${salary.due.toFixed(2)}`,
    <div className="flex space-x-2">
      <button
        className="text-blue-500 text-sm hover:underline"
        onClick={() => openModal(salary)}
      >
        Edit
      </button>
      <button
        className="text-green-500 text-sm hover:underline"
        onClick={() => handleAddBorrow(salary)}
      >
        Add Borrow
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
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
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
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {currentSalary ? "Edit Salary" : "Add Salary"}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee
                  </label>
                  <select
                    name="employee"
                    value={formData.employee?._id || ""}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200"
                    required
                    disabled={!!currentSalary}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date (YYYY-MM-DD)
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Salary
                  </label>
                  <input
                    type="number"
                    name="baseSalary"
                    value={formData.baseSalary}
                    disabled
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bonus (optional)
                  </label>
                  <input
                    type="number"
                    name="bonus"
                    value={formData.bonus}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deduction (optional)
                  </label>
                  <input
                    type="number"
                    name="deduction"
                    value={formData.deduction}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Borrowed History
                  </label>
                  <div className="space-y-2 mb-4">
                    {(formData.borrowedHistory || []).map((entry, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 text-sm border-b pb-2"
                      >
                        <span>
                          {new Date(entry.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span>₹{entry.amount.toFixed(2)}</span>
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => removeBorrowEntry(index)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    {(formData.borrowedHistory || []).length === 0 && (
                      <div className="text-sm text-gray-500">
                        No borrow entries
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      name="newBorrowDate"
                      value={formData.newBorrowDate || ""}
                      onChange={handleInputChange}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                    <input
                      type="number"
                      name="newBorrowAmount"
                      value={formData.newBorrowAmount || ""}
                      onChange={handleInputChange}
                      placeholder="Amount"
                      className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      min="0"
                    />
                    <button
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      onClick={addBorrowEntry}
                    >
                      Add
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Borrowed
                  </label>
                  <input
                    type="number"
                    name="borrowed"
                    value={formData.borrowed}
                    disabled
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Amount
                  </label>
                  <input
                    type="number"
                    name="due"
                    value={formData.due}
                    disabled
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
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
