import { useEffect, useState } from "react";
import useExpense from "../hooks/useExpense";
import UserActions from "../components/layout/headers/UserActions";
import Table from "../components/ui/Table";
import Sidebar from "../components/layout/Sidebar";
import InputField from "../components/common/input/input";
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

  useEffect(() => {
    fetchExpenses();
  }, []);

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

  const onEdit = (item: Expense) => {
    prepareEdit(item);
    setEditError(null);
    setIsEditModalOpen(true);
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
      await handleEditSubmit(e); // Call the hook's handleEditSubmit
      closeEditModal(); // Close modal on success
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update expense";
      setEditError(errorMessage);
    } finally {
      setIsEditLoading(false);
    }
  };

  const data = expenses.map(
    (item: Expense) =>
      [
        item.category,
        item.amount.toString(),
        new Date(item.date).toLocaleDateString(),
        <div className="space-x-2" key={`${item._id}-actions`}>
          <button
            onClick={() => onEdit(item)}
            className="text-blue-500 hover:underline"
            disabled={isEditLoading}
          >
            Edit
          </button>
          <span className="text-gray-400">|</span>
          <button
            onClick={() => handleDelete(item)}
            className="text-red-500 hover:underline"
            disabled={isEditLoading}
          >
            Delete
          </button>
        </div>,
      ] as (string | number)[]
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="hidden md:block bg-white ">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col w-full md:w-auto p-4 sm:p-6 lg:p-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            Expenses
          </h1>
          <div className="flex space-x-2">
            <UserActions />
            <button
              onClick={openAddModal}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Add New Expense
            </button>
          </div>
        </div>
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <Table headers={headers} data={data} />
        </div>
        {isEditModalOpen && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Edit Expense</h2>
              {editError && (
                <div className="text-red-500 text-sm mb-4">{editError}</div>
              )}
              <form
                onSubmit={handleEditSubmitWithLoading}
                className="space-y-4"
              >
                {editFields.map((field, index) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
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
                        setEditError(null); // Clear error on input change
                      }}
                      className="w-full"
                 
                    />
                  </div>
                ))}
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                    disabled={isEditLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
                    disabled={isEditLoading}
                  >
                    {isEditLoading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-white"
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
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {isAddModalOpen && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Add New Expense</h2>
              <ExpenseForm
                setExpenses={setExpenses}
                onSuccess={closeAddModal}
              />
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expenses;
