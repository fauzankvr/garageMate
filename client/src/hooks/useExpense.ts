import { useState } from "react";
import instance from "../axios/axios";
import type { Expense } from "../components/ui/ExpeseForm";

// Define the Field interface
interface Field {
  name: string;
  label: string;
  type: "text" | "number" | "date";
  placeholder: string;
  value: string;
}

// Define the return type of the hook
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

const useExpense = (): UseExpenseReturn => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [editFields, setEditFields] = useState<Field[]>([
    {
      name: "category",
      label: "Category",
      type: "text",
      placeholder: "Enter expense category",
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
  const [editExpenseId, setEditExpenseId] = useState<string | null>(null); // Store the ID of the expense being edited

  const headers = ["Category", "Amount", "Date", "Actions"];

  const fetchExpenses = async () => {
    try {
      const res = await instance.get("/api/expense");
      setExpenses(res.data);
    } catch (error) {
      console.error("❌ Error fetching expenses:", error);
    }
  };

  const prepareEdit = (expense: Expense) => {
    setEditFields([
      {
        name: "category",
        label: "Category",
        type: "text",
        placeholder: "Enter expense category",
        value: expense.category,
      },
      {
        name: "amount",
        label: "Amount",
        type: "number",
        placeholder: "Enter expense amount",
        value: expense.amount.toString(),
      },
      {
        name: "date",
        label: "Date",
        type: "date",
        placeholder: "Select expense date",
        value: new Date(expense.date).toISOString().split("T")[0],
      },
    ]);
    setEditExpenseId(expense._id); // Store the ID
  };

  const handleEditInputChange = (
    index: number,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const value = e.target.value;
    setEditFields((prev) => {
      const updated = [...prev];
      updated[index].value = value;
      return updated;
    });
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editExpenseId) {
      console.error("❌ No expense ID for editing");
      return;
    }

    const data = editFields.reduce((acc, field) => {
      acc[field.name] =
        field.name === "amount"
          ? Number(field.value)
          : field.name === "date"
          ? new Date(field.value)
          : field.value;
      return acc;
    }, {} as Record<string, string | number | Date>);

    try {
      const res = await instance.put(`/api/expense/${editExpenseId}`, data);
      setExpenses((prev) =>
        prev.map((expense) =>
          expense._id === res.data._id ? res.data : expense
        )
      );
      console.log("✅ Expense updated:", res.data);
    } catch (error) {
      console.error("❌ Error updating expense:", error);
    }
  };

  const handleDelete = async (expense: Expense) => {
    try {
      await instance.delete(`/api/expense/${expense._id}`);
      setExpenses((prev) => prev.filter((item) => item._id !== expense._id));
      console.log("✅ Expense deleted:", expense._id);
    } catch (error) {
      console.error("❌ Error deleting expense:", error);
    }
  };

  return {
    expenses,
    headers,
    fetchExpenses,
    prepareEdit,
    handleDelete,
    editFields,
    handleEditInputChange,
    handleEditSubmit,
    setExpenses,
  };
};

export default useExpense;
