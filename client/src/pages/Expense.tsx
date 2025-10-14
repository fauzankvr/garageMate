import { useEffect, useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import useExpense from "../hooks/useExpense";
import UserActions from "../components/layout/headers/UserActions";
import Table from "../components/ui/Table";
import Sidebar from "../components/layout/Sidebar";
import InputField from "../components/common/input/input";
import instance from "../axios/axios";
import type { Expense } from "../types/Expense";
import ExpenseForm from "../components/ui/ExpeseForm";

// Define the Field interface
interface Field {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "date";
  placeholder: string;
  value: string;
}

// Define the return type of useExpense hook
interface UseExpenseReturn {
  expenses: Expense[];
  headers: string[];
  fetchExpenses: () => Promise<void>;
  prepareEdit: (expense: Expense) => void;
  handleDelete: (expense: Expense) => Promise<void>;
  editFields: Field[];
  handleEditInputChange: (
    index: number,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleEditSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
}

const Expenses = () => {
  const {
    expenses,
    headers,
    fetchExpenses,
    prepareEdit,
    handleDelete,
    editFields,
    handleEditInputChange,
    handleEditSubmit,
    setExpenses,
  } = useExpense() as UseExpenseReturn;

  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditLoading, setIsEditLoading] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [initialFetchDone, setInitialFetchDone] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Password modal states
  const [passwordModalOpen, setPasswordModalOpen] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isPasswordSubmitting, setIsPasswordSubmitting] =
    useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<{
    type: "edit" | "delete";
    item?: Expense;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Fixed useEffect - only run once on mount
  useEffect(() => {
    let isMounted = true;

    const loadExpenses = async () => {
      try {
        setIsLoading(true);
        await fetchExpenses();
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setInitialFetchDone(true);
        }
      }
    };

    loadExpenses();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - runs only once on mount

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

        if (pendingAction?.type === "edit" && pendingAction.item) {
          prepareEdit(pendingAction.item);
          setEditError(null);
          setIsEditModalOpen(true);
        } else if (pendingAction?.type === "delete" && pendingAction.item) {
          if (window.confirm("Are you sure you want to delete this expense?")) {
            try {
              await handleDelete(pendingAction.item);
              // Refresh expenses after successful deletion
              await fetchExpenses();
            } catch (error: any) {
              console.error("Error deleting expense:", error);
              setEditError("Failed to delete expense. Please try again.");
            }
          }
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

  const onEdit = (item: Expense) => {
    setPendingAction({ type: "edit", item });
    setPasswordModalOpen(true);
    setPassword("");
    setPasswordError(null);
    setIsPasswordSubmitting(false);
  };

  const onDelete = (item: Expense) => {
    setPendingAction({ type: "delete", item });
    setPasswordModalOpen(true);
    setPassword("");
    setPasswordError(null);
    setIsPasswordSubmitting(false);
  };

  // Get unique categories for filter dropdown
  const categories = [
    { value: "all", label: "All Categories" },
    ...Array.from(new Set(expenses.map((expense) => expense.category)))
      .sort()
      .map((category) => ({ value: category, label: category })),
  ];

  // Filter expenses
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      searchTerm === "" ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.amount.toString().includes(searchTerm);

    const expenseDate = new Date(expense.date);
    const matchesDateRange =
      (startDate === "" || expenseDate >= new Date(startDate)) &&
      (endDate === "" || expenseDate <= new Date(endDate));

    const matchesCategory =
      selectedCategory === "all" || expense.category === selectedCategory;

    return matchesSearch && matchesDateRange && matchesCategory;
  });

  // Calculate total expenses
  const totalExpenses = filteredExpenses
    .reduce((sum, expense) => sum + expense.amount, 0)
    .toFixed(2);

  const validateEditFields = (): boolean => {
    for (const field of editFields) {
      if (!field.value.trim()) {
        setEditError(`${field.label} is required`);
        return false;
      }
      if (field.name === "amount" && Number(field.value) <= 0) {
        setEditError("Amount must be greater than 0");
        return false;
      }
    }
    return true;
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditError(null);
    setIsEditLoading(false);
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleEditSubmitWithLoading = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!validateEditFields()) return;

    setIsEditLoading(true);
    setEditError(null);

    try {
      await handleEditSubmit(e);
      closeEditModal();
      // Refresh expenses after successful edit
      await fetchExpenses();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update expense";
      setEditError(errorMessage);
    } finally {
      setIsEditLoading(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setSelectedCategory("all");
  };

  const data = filteredExpenses.map(
    (item: Expense) =>
      [
        item.category,
        item.description || "No description",
        `₹${item.amount.toFixed(2)}`,
        new Date(item.date).toLocaleDateString(),
        <div className="space-x-2" key={`actions-${item._id}`}>
          <button
            onClick={() => onEdit(item)}
            className="text-blue-500 hover:underline text-sm"
            disabled={isPasswordSubmitting || isEditLoading}
          >
            Edit
          </button>
          <span className="text-gray-400">|</span>
          <button
            onClick={() => onDelete(item)}
            className="text-red-500 hover:underline text-sm"
            disabled={isPasswordSubmitting || isEditLoading}
          >
            Delete
          </button>
        </div>,
      ] as const
  );

  // Show loading state
  if (isLoading && !initialFetchDone) {
    return (
      <div className="flex min-h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="hidden md:block bg-white">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col w-full md:w-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            Expenses
          </h1>
          <div className="flex space-x-2">
            <UserActions />
            <button
              onClick={openAddModal}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm disabled:bg-gray-400"
              disabled={isPasswordSubmitting || isEditLoading}
            >
              Add New Expense
            </button>
          </div>
        </div>

        {/* Total Expenses Display */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-lg mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-lg font-bold">Total Expenses</span>
          </div>
          <span className="text-2xl font-semibold">₹{totalExpenses}</span>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-end lg:items-center">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  disabled={isPasswordSubmitting}
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="flex flex-col">
                <label className="text-xs text-gray-600 mb-1">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  disabled={isPasswordSubmitting}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-600 mb-1">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  disabled={isPasswordSubmitting}
                />
              </div>
            </div>
            <div className="min-w-[140px]">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={isPasswordSubmitting}
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm disabled:bg-gray-400"
                disabled={isPasswordSubmitting}
              >
                Reset
              </button>
            </div>
          </div>
          {(searchTerm ||
            startDate ||
            endDate ||
            selectedCategory !== "all") && (
            <div className="mt-3 text-xs text-gray-600">
              Showing {filteredExpenses.length} of {expenses.length} expenses
              {searchTerm && ` • Searched: "${searchTerm}"`}
              {(startDate || endDate) &&
                ` • Date: ${startDate || "..."} to ${endDate || "..."}`}
              {selectedCategory !== "all" && ` • Category: ${selectedCategory}`}
            </div>
          )}
        </div>

        {/* Expenses Table */}
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <div className="flex justify-between items-center p-4 border-b">
            <span className="text-sm text-gray-600">
              {filteredExpenses.length}{" "}
              {filteredExpenses.length === 1 ? "expense" : "expenses"} found
            </span>
          </div>
          {editError && !passwordModalOpen && (
            <div className="p-4 text-center text-red-500">{editError}</div>
          )}
          {filteredExpenses.length === 0 && initialFetchDone && (
            <div className="p-4 text-center text-gray-500">
              {searchTerm || startDate || endDate || selectedCategory !== "all"
                ? "No expenses found for the applied filters."
                : "No expenses available."}
            </div>
          )}
          {filteredExpenses.length > 0 && (
            <Table headers={headers} data={data} />
          )}
        </div>

        {/* Password Modal */}
        {passwordModalOpen && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">
                  {isPasswordSubmitting ? "Verifying..." : "Enter Password"}
                </h3>
                <button
                  onClick={closePasswordModal}
                  className="text-gray-400 hover:text-gray-600 disabled:text-gray-200"
                  disabled={isPasswordSubmitting}
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
                  placeholder="Enter password"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 pr-10 disabled:bg-gray-100"
                  autoFocus
                  disabled={isPasswordSubmitting}
                />
                <button
                  type="button"
                  onClick={() =>
                    !isPasswordSubmitting && setShowPassword(!showPassword)
                  }
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:text-gray-300"
                  title={showPassword ? "Hide password" : "Show password"}
                  disabled={isPasswordSubmitting}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {passwordError && (
                  <p className="text-red-500 text-sm mt-2">{passwordError}</p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={closePasswordModal}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={isPasswordSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  className={`flex-1 py-2 rounded-lg text-white flex items-center justify-center ${
                    isPasswordSubmitting
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
                    "Submit"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Edit Expense</h2>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={isEditLoading}
                >
                  <X size={20} />
                </button>
              </div>
              {editError && (
                <div className="text-red-500 text-sm mb-4">{editError}</div>
              )}
              <form
                onSubmit={handleEditSubmitWithLoading}
                className="space-y-3"
              >
                {editFields.map((field, index) => (
                  <div key={field.name}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {field.label}
                    </label>
                    <InputField
                      label={field.label}
                      name={field.name}
                      type={field.type}
                      value={field.value}
                      placeholder={field.placeholder}
                      onChange={(e) => {
                        handleEditInputChange(index, e);
                        setEditError(null);
                      }}
                      className="w-full text-sm"
                      disabled={isEditLoading}
                    />
                  </div>
                ))}
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition text-sm disabled:bg-gray-400"
                    disabled={isEditLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:bg-blue-400 disabled:cursor-not-allowed text-sm flex items-center"
                    disabled={isEditLoading}
                  >
                    {isEditLoading ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 mr-2 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Add New Expense</h2>
                <button
                  onClick={closeAddModal}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={isPasswordSubmitting}
                >
                  <X size={20} />
                </button>
              </div>
              <ExpenseForm
                setExpenses={setExpenses}
                onSuccess={closeAddModal}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expenses;
