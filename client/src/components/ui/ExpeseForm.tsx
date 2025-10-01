import { useState } from "react";
import instance from "../../axios/axios";
import type { Expense } from "../../types/Expense";

// Define the Field interface
interface Field {
  name: string;
  label: string;
  type: "text" | "number" | "date";
  placeholder: string;
  value: string;
}

// Define the Props interface for ExpenseForm
interface ExpenseFormProps {
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  onSuccess?: () => void;
}

const ExpenseForm = ({ setExpenses, onSuccess }: ExpenseFormProps) => {
  const [fields, setFields] = useState<Field[]>([
    {
      name: "category",
      label: "Category",
      type: "text",
      placeholder: "Enter expense category",
      value: "",
    },
    {
      name: "description",
      label: "Description",
      type: "text",
      placeholder: "Enter expense descripion",
      value: "",
    },
    {
      name: "amount",
      label: "Amount",
      type: "number",
      placeholder: "Enter expense amount",
      value: "",
    },
    {
      name: "date",
      label: "Date",
      type: "date",
      placeholder: "Select expense date",
      value: "",
    },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const validateFields = (): boolean => {
    for (const field of fields) {
      if (!field.value.trim()) {
        setError(`${field.label} is required`);
        return false;
      }
      if (field.name === "amount" && Number(field.value) <= 0) {
        setError("Amount must be greater than 0");
        return false;
      }
    }
    return true;
  };

  const handleInputChange = (
    index: number,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const value = e.target.value;
    setFields((prev) => {
      const updated = [...prev];
      updated[index].value = value;
      return updated;
    });
    setError(null); // Clear error on input change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields()) return;

    setIsLoading(true);
    setError(null);

    const data = fields.reduce((acc, field) => {
      acc[field.name] =
        field.name === "amount"
          ? Number(field.value)
          : field.name === "date"
          ? new Date(field.value)
          : field.value;
      return acc;
    }, {} as Record<string, string | number | Date>);

    try {
      const res = await instance.post("/api/expense", data);
      setExpenses((prev: Expense[]) => [...prev, res.data]);
      console.log("✅ Expense created:", res.data);
      setFields(fields.map((field) => ({ ...field, value: "" }))); // Reset form
      if (onSuccess) onSuccess(); // Close modal
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to create expense";
      setError(errorMessage);
      console.error("❌ Error creating expense:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 mx-auto bg-white rounded-2xl"
    >
      {error && (
        <div className="md:col-span-2 text-red-500 text-sm mb-4">{error}</div>
      )}
      {fields.map((field, index) => (
        <div key={field.name}>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            {field.label}
          </label>
          <input
            type={field.type}
            value={field.value}
            onChange={(e) => handleInputChange(index, e)}
            placeholder={field.placeholder}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isLoading}
          />
        </div>
      ))}
      <div className="md:col-span-2">
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? (
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
              Submitting...
            </span>
          ) : (
            "Submit"
          )}
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;
