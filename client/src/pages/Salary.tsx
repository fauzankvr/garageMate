import { useEffect, useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editError, setEditError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [initialFetchDone, setInitialFetchDone] = useState<boolean>(false);

  // Password modal states
  const [passwordModalOpen, setPasswordModalOpen] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isPasswordSubmitting, setIsPasswordSubmitting] =
    useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<{
    type: "edit" | "delete" | "addBorrow" | "editSalary";
    salary?: Salary;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Fixed useEffect - only run once on mount
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [salaryResponse, employeeResponse] = await Promise.all([
          instance.get("/api/salaries"),
          instance.get("/api/employee"),
        ]);
        if (isMounted) {
          setSalaries(salaryResponse.data);
          setEmployees(employeeResponse.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (isMounted) {
          setEditError("Failed to fetch data. Please try again.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setInitialFetchDone(true);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Verify password via API
  const verifyPassword = async (password: string): Promise<boolean> => {
    try {
      const res = await instance.post("/api/customer/verify-password", {
        password,
      });
      return res.data.success;
    } catch (err: any) {
      console.error("Error verifying password:", err);
      setPasswordError(
        err.response?.data?.message || "Failed to verify password"
      );
      return false;
    }
  };

  // Handle password submission with proper loading state
  const handlePasswordSubmit = async () => {
    if (!password || isPasswordSubmitting) {
      return;
    }

    if (!password.trim()) {
      setPasswordError("Please enter a password");
      return;
    }

    setIsPasswordSubmitting(true);
    setPasswordError(null);

    try {
      const isValid = await verifyPassword(password);
      if (isValid) {
        setPasswordModalOpen(false);
        setPassword("");

        const action = pendingAction;
        if (!action) return;

        switch (action.type) {
          case "edit":
            if (action.salary) {
              setCurrentSalary(action.salary);
              setFormData({
                employee: action.salary.employee,
                date: new Date(action.salary.date).toISOString().split("T")[0],
                baseSalary: action.salary.baseSalary,
                bonus: action.salary.bonus || 0,
                deduction: action.salary.deduction || 0,
                borrowed: action.salary.borrowed || 0,
                borrowedHistory: action.salary.borrowedHistory || [],
                due: action.salary.due || 0,
                newBorrowDate: "",
                newBorrowAmount: 0,
              });
              setIsModalOpen(true);
              setEditError(null);
            }
            break;

          case "addBorrow":
            if (action.salary) {
              setCurrentSalary(action.salary);
              setFormData({
                employee: action.salary.employee,
                date: new Date(action.salary.date).toISOString().split("T")[0],
                baseSalary: action.salary.baseSalary,
                bonus: action.salary.bonus || 0,
                deduction: action.salary.deduction || 0,
                borrowed: action.salary.borrowed || 0,
                borrowedHistory: action.salary.borrowedHistory || [],
                due: action.salary.due || 0,
                newBorrowDate: "",
                newBorrowAmount: 0,
              });
              setIsModalOpen(true);
              setEditError(null);
            }
            break;

          case "delete":
            // Show confirmation dialog AFTER password verification
            if (action.salary?._id) {
              const employeeName = action.salary.employee.name;
              const shouldDelete = window.confirm(
                `Are you sure you want to delete the salary record for ${employeeName}?\n\nDate: ${new Date(
                  action.salary.date
                ).toLocaleDateString()}\nBase Salary: ₹${action.salary.baseSalary.toFixed(
                  2
                )}\n\nThis action cannot be undone.`
              );

              if (shouldDelete) {
                try {
                  const response = await instance.delete(
                    `/api/salaries/${action.salary._id}`
                  );
                  if (response.status === 200) {
                    setSalaries((prev) =>
                      prev.filter((sal) => sal._id !== action.salary?._id)
                    );
                    setEditError(null);
                  } else {
                    setEditError("Failed to delete salary.");
                  }
                } catch (error: any) {
                  setEditError(
                    error.response?.data?.message ||
                    "Error deleting salary. Please try again."
                  );
                }
              }
            }
            break;

          case "editSalary":
            // Handle edit salary after password verification
            if (action.salary?._id && formData.employee?._id) {
              try {
                const payload = {
                  employee: formData.employee._id,
                  date: formData.date,
                  baseSalary: Number(formData.baseSalary),
                  bonus: Number(formData.bonus) || 0,
                  deduction: Number(formData.deduction) || 0,
                  borrowed: Number(formData.borrowed) || 0,
                  borrowedHistory: formData.borrowedHistory || [],
                  due: Number(formData.due) || 0,
                };
                const response = await instance.put(
                  `/api/salaries/${action.salary._id}`,
                  payload
                );
                if (response.status === 200) {
                  const updatedSalary = response.data;
                  setSalaries((prev) =>
                    prev.map((sal) =>
                      sal._id === updatedSalary._id ? updatedSalary : sal
                    )
                  );
                  setIsModalOpen(false);
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
                  setEditError(null);
                } else {
                  setEditError("Failed to update salary.");
                }
              } catch (error: any) {
                setEditError(
                  error.response?.data?.message ||
                  "Error updating salary. Please try again."
                );
              }
            }
            break;
        }
      } else {
        setPasswordError("Invalid password");
      }
    } catch (error) {
      console.error("Password submission error:", error);
      setPasswordError("An error occurred. Please try again.");
    } finally {
      setIsPasswordSubmitting(false);
      setPendingAction(null);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isPasswordSubmitting) {
      handlePasswordSubmit();
    }
  };

  // Close password modal
  const closePasswordModal = () => {
    setPasswordModalOpen(false);
    setPassword("");
    setPasswordError(null);
    setIsPasswordSubmitting(false);
    setPendingAction(null);
  };

  // Handle deleting a salary - Password first, then confirmation
  const onDelete = (salary: Salary) => {
    setPendingAction({
      type: "delete",
      salary,
    });
    setPasswordModalOpen(true);
    setPassword("");
    setPasswordError(null);
    setIsPasswordSubmitting(false);
  };

  // Find the most recent salary record for an employee
  const getPreviousSalary = (employeeId: string): Salary | null => {
    console.log(salaries);
    const employeeSalaries = salaries
      .filter((sal) => sal._id === employeeId)
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
      return baseSalary + bonus - deduction - borrowed;
    }
    const newDateObj = new Date(newDate);
    const prevDateObj = new Date(prevSalary.date);
    const isSameMonth =
      newDateObj.getFullYear() === prevDateObj.getFullYear() &&
      newDateObj.getMonth() === prevDateObj.getMonth();
    return isSameMonth
      ? (prevSalary.due || 0) - borrowed
      : baseSalary + bonus - deduction - borrowed;
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
          [name]: name === "newBorrowAmount" ? Number(value) || 0 : value,
        };
        const borrowed = calculateBorrowed(newFormData.borrowedHistory || []);
        let bonusVal = prev.bonus || 0;
        let deductionVal = prev.deduction || 0;
        let dateVal = prev.date || "";

        if (name === "bonus") bonusVal = Number(value) || 0;
        if (name === "deduction") deductionVal = Number(value) || 0;
        if (name === "date") dateVal = value;

        return {
          ...newFormData,
          borrowed,
          due: calculateDue(
            prev.employee?._id || "",
            prev.baseSalary || 0,
            bonusVal,
            deductionVal,
            borrowed,
            dateVal
          ),
        };
      });
    }
    setEditError(null);
  };

  // Add a new borrow entry
  const addBorrowEntry = () => {
    if (
      !formData.newBorrowDate ||
      formData.newBorrowAmount === undefined ||
      formData.newBorrowAmount <= 0
    ) {
      setEditError("Please provide both borrow date and valid amount.");
      return;
    }
    const newEntry: BorrowedEntry = {
      date: formData.newBorrowDate!,
      amount: formData.newBorrowAmount!,
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
    setEditError(null);
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

  // Handle adding a new salary - NO PASSWORD REQUIRED
  const handleAddSalary = async () => {
    if (!formData.employee?._id || !formData.date) {
      setEditError("Please fill all required fields with valid data.");
      return;
    }

    try {
      const payload = {
        employee: formData.employee._id,
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
        closeSalaryModal();
        setEditError(null);
      } else {
        setEditError("Failed to add salary.");
      }
    } catch (error: any) {
      setEditError(
        error.response?.data?.message ||
        "Error adding salary. Please try again."
      );
    }
  };

  // Handle editing a salary - NO PASSWORD REQUIRED
  const handleEditSalary = async () => {
    if (!currentSalary?._id || !formData.employee?._id) {
      setEditError("Invalid salary data.");
      return;
    }

    try {
      const payload = {
        employee: formData.employee._id,
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
        setIsModalOpen(false);
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
        setEditError(null);
      } else {
        setEditError("Failed to update salary.");
      }
    } catch (error: any) {
      setEditError(
        error.response?.data?.message ||
        "Error updating salary. Please try again."
      );
    }
  };

  // Handle adding a borrow entry via button - REQUIRES PASSWORD
  const handleAddBorrow = (salary: Salary) => {
    setPendingAction({ type: "addBorrow", salary });
    setPasswordModalOpen(true);
    setPassword("");
    setPasswordError(null);
    setIsPasswordSubmitting(false);
  };

  // Open modal for adding (NO PASSWORD) or editing (NO PASSWORD)
  const openModal = (salary?: Salary) => {
    if (salary) {
      // EDIT - Requires password
      setPendingAction({ type: "edit", salary });
      setPasswordModalOpen(true);
      setPassword("");
      setPasswordError(null);
      setIsPasswordSubmitting(false);
    } else {
      // ADD - No password required
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
      setIsModalOpen(true);
      setEditError(null);
    }
  };

  // Close salary modal
  const closeSalaryModal = () => {
    setIsModalOpen(false);
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
    setEditError(null);
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

  // Filter salaries based on search query
  const filteredSalaries = salaries.filter(
    (salary) =>
      salary.employee?.name && // Must exist and have a name
      salary.employee.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Table data
  const data = filteredSalaries.map((salary) => [
    salary.employee.name,
    new Date(salary.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    `₹${salary.baseSalary.toFixed(2)}`,
    `₹${(salary.bonus || 0).toFixed(2)}`,
    `₹${(salary.deduction || 0).toFixed(2)}`,
    <span
      key={`borrowed-${salary._id}`}
      className={`${salary.borrowed > 0 ? "text-red-600 font-medium" : "text-gray-600"
        }`}
    >
      ₹{salary.borrowed.toFixed(2)}
    </span>,
    `₹${salary.due.toFixed(2)}`,
    <div key={`actions-${salary._id}`} className="flex space-x-2">
      <button
        className="text-blue-500 text-sm hover:underline disabled:opacity-50"
        onClick={() => openModal(salary)}
        disabled={isPasswordSubmitting}
      >
        Edit
      </button>
      <button
        className="text-green-500 text-sm hover:underline disabled:opacity-50"
        onClick={() => handleAddBorrow(salary)}
        disabled={isPasswordSubmitting}
      >
        Add Borrow
      </button>
      <button
        className="text-red-500 text-sm hover:underline disabled:opacity-50"
        onClick={() => onDelete(salary)}
        disabled={isPasswordSubmitting}
      >
        Delete
      </button>
    </div>,
  ]);

  // Show loading state
  if (isLoading && !initialFetchDone) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading salaries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            Salary Management
          </h1>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <div className="flex-1 sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter employee name..."
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200 disabled:bg-gray-100"
                disabled={isPasswordSubmitting}
              />
            </div>
            <div className="flex space-x-2">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={() => openModal()} // ADD - No password required
                disabled={isPasswordSubmitting}
              >
                Add Salary
              </button>
              <UserActions />
            </div>
          </div>
        </div>

        {editError && !passwordModalOpen && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg text-sm border-l-4 border-red-500">
            {editError}
          </div>
        )}

        {filteredSalaries.length === 0 && initialFetchDone && (
          <div className="p-4 text-center text-gray-500 bg-white rounded-lg shadow">
            {searchQuery
              ? `No salaries found for "${searchQuery}".`
              : "No salaries available. Add your first salary record!"}
          </div>
        )}
        {filteredSalaries.length > 0 && (
          <div className="w-full bg-white rounded-lg shadow overflow-hidden">
            <Table headers={headers} data={data} />
          </div>
        )}

        {/* Password Modal - Only for Edit/Delete/Add Borrow */}
        {passwordModalOpen && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isPasswordSubmitting ? "Verifying..." : "Enter Password"}
                </h3>
                <button
                  onClick={closePasswordModal}
                  className="text-gray-400 hover:text-gray-600 disabled:text-gray-200 p-1 rounded-full hover:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={isPasswordSubmitting}
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mb-4 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                  autoFocus
                  disabled={isPasswordSubmitting}
                />
                <button
                  type="button"
                  onClick={() =>
                    !isPasswordSubmitting && setShowPassword(!showPassword)
                  }
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:text-gray-300 p-1 rounded-full hover:bg-gray-100"
                  title={showPassword ? "Hide password" : "Show password"}
                  disabled={isPasswordSubmitting}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {passwordError && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {passwordError}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={closePasswordModal}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  disabled={isPasswordSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  className={`flex-1 py-2.5 rounded-lg text-white flex items-center justify-center text-sm font-medium transition-colors ${isPasswordSubmitting || !password.trim()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  disabled={isPasswordSubmitting || !password.trim()}
                >
                  {isPasswordSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    "Verify"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Add/Edit Salary */}
        {isModalOpen && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {currentSalary ? "Edit Salary" : "Add New Salary"}
                </h2>
                <button
                  onClick={closeSalaryModal}
                  className="text-gray-400 hover:text-gray-600 disabled:text-gray-300 p-1 rounded-full hover:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={isPasswordSubmitting}
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {editError && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm border-l-4 border-red-500">
                    {editError}
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="employee"
                      value={formData.employee?._id || ""}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200 disabled:bg-gray-100"
                      required
                      disabled={!!currentSalary || isPasswordSubmitting}
                    >
                      <option value="" disabled>
                        Select an employee
                      </option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.name} - {emp.phone} (₹{emp.baseSalary})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salary Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200 disabled:bg-gray-100"
                      required
                      disabled={isPasswordSubmitting}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Base Salary
                      </label>
                      <input
                        type="number"
                        name="baseSalary"
                        value={formData.baseSalary}
                        disabled
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-gray-100 cursor-not-allowed text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bonus
                      </label>
                      <input
                        type="number"
                        name="bonus"
                        value={formData.bonus || ""}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200 disabled:bg-gray-100 text-sm"
                        placeholder="0.00"
                        disabled={isPasswordSubmitting}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deduction
                      </label>
                      <input
                        type="number"
                        name="deduction"
                        value={formData.deduction || ""}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200 disabled:bg-gray-100 text-sm"
                        placeholder="0.00"
                        disabled={isPasswordSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Borrowed
                      </label>
                      <input
                        type="number"
                        name="borrowed"
                        value={formData.borrowed}
                        disabled
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-gray-100 cursor-not-allowed text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Amount
                    </label>
                    <input
                      type="number"
                      name="due"
                      value={formData.due}
                      disabled
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-gray-100 cursor-not-allowed text-lg font-semibold text-green-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Borrow History
                    </label>
                    <div className="space-y-2 mb-4">
                      {(formData.borrowedHistory ?? []).length > 0 ? (
                        formData.borrowedHistory!.map((entry, index) => (
                          <div
                            key={`borrow-${index}`}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm border"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-gray-600">
                                {new Date(entry.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </span>
                              <span className="text-red-600 font-medium">
                                ₹{entry.amount.toFixed(2)}
                              </span>
                            </div>
                            <button
                              className="text-red-500 hover:text-red-700 disabled:opacity-50 text-sm"
                              onClick={() => removeBorrowEntry(index)}
                              disabled={isPasswordSubmitting}
                            >
                              Remove
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg text-center">
                          No borrow entries
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2 p-3 bg-blue-50 rounded-lg">
                      <input
                        type="date"
                        name="newBorrowDate"
                        value={formData.newBorrowDate || ""}
                        onChange={handleInputChange}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 text-sm"
                        disabled={isPasswordSubmitting}
                      />
                      <input
                        type="number"
                        name="newBorrowAmount"
                        value={formData.newBorrowAmount || ""}
                        onChange={handleInputChange}
                        placeholder="Amount"
                        min="0"
                        step="0.01"
                        className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 text-sm"
                        disabled={isPasswordSubmitting}
                      />
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                        onClick={addBorrowEntry}
                        disabled={
                          isPasswordSubmitting ||
                          !formData.newBorrowDate ||
                          !formData.newBorrowAmount ||
                          formData.newBorrowAmount <= 0
                        }
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50">
                <button
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                  onClick={closeSalaryModal}
                  disabled={isPasswordSubmitting}
                >
                  Cancel
                </button>
                <button
                  className={`px-6 py-2.5 rounded-lg text-white font-medium text-sm transition-colors disabled:cursor-not-allowed ${currentSalary
                    ? "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                    : "bg-green-600 hover:bg-green-700"
                    }`}
                  onClick={currentSalary ? handleEditSalary : handleAddSalary}
                  disabled={
                    isPasswordSubmitting ||
                    !formData.employee?._id ||
                    !formData.date
                  }
                >
                  {currentSalary
                    ? "Update Salary"
                    : "Add Salary"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Salaries;
