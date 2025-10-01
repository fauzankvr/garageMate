import { useState } from "react";
import instance from "../axios/axios";
import type { Warranty } from "../types/Warranty";

// Define the Field interface
interface Field {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select";
  placeholder?: string;
  value: string;
  options?: string[];
}

// Define the return type of the hook
interface UseWarrantyReturn {
  warranties: Warranty[];
  headers: string[];
  fetchWarranties: () => Promise<void>;
  prepareEdit: (warranty: Warranty) => void;
  handleDelete: (warranty: Warranty) => Promise<void>;
  editFields: Field[];
  handleEditInputChange: (
    index: number,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleEditSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  setWarranties: React.Dispatch<React.SetStateAction<Warranty[]>>;
}

const useWarranty = (): UseWarrantyReturn => {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [editFields, setEditFields] = useState<Field[]>([
    {
      name: "packageName",
      label: "Package Name",
      type: "text",
      placeholder: "Enter package name",
      value: "",
    },
    {
      name: "duration",
      label: "Duration (months)",
      type: "number",
      placeholder: "Enter duration in months",
      value: "",
    },
    {
      name: "cost",
      label: "Cost",
      type: "number",
      placeholder: "Enter cost",
      value: "",
    },
    {
      name: "allowedVisits",
      label: "Allowed Visits",
      type: "number",
      placeholder: "Enter allowed visits",
      value: "",
    },
    {
      name: "customerName",
      label: "Customer Name",
      type: "text",
      placeholder: "Enter customer name",
      value: "",
    },
    {
      name: "mobileNumber",
      label: "Mobile Number",
      type: "text",
      placeholder: "Enter mobile number",
      value: "",
    },
    {
      name: "carName",
      label: "Car Name",
      type: "text",
      placeholder: "Enter car name",
      value: "",
    },
    {
      name: "numberPlate",
      label: "Number Plate",
      type: "text",
      placeholder: "Enter number plate",
      value: "",
    },
    {
      name: "issuedDate",
      label: "Issued Date",
      type: "date",
      placeholder: "Select issued date",
      value: "",
    },
    {
      name: "lastDueDate",
      label: "Last Due Date",
      type: "date",
      placeholder: "Select last due date",
      value: "",
    },
    {
      name: "notes",
      label: "Notes",
      type: "text",
      placeholder: "Enter notes (optional)",
      value: "",
    },
  ]);
  const [editWarrantyId, setEditWarrantyId] = useState<string | null>(null);

  const headers = [
    "Package Name",
    "Duration",
    "Cost",
    "Allowed Visits",
    "Customer Name",
    "Number Plate",
    "Issued Date",
    "Last Due Date",
    "Actions",
  ];

  const fetchWarranties = async () => {
    try {
      const res = await instance.get("/api/warranties");
      setWarranties(res.data);
    } catch (error) {
      console.error("❌ Error fetching warranties:", error);
    }
  };

  const prepareEdit = (warranty: Warranty) => {
    setEditFields([
      {
        name: "packageName",
        label: "Package Name",
        type: "text",
        placeholder: "Enter package name",
        value: warranty.packageName,
      },
      {
        name: "duration",
        label: "Duration (months)",
        type: "number",
        placeholder: "Enter duration in months",
        value: warranty.duration.toString(),
      },
      {
        name: "cost",
        label: "Cost",
        type: "number",
        placeholder: "Enter cost",
        value: warranty.cost.toString(),
      },
      {
        name: "allowedVisits",
        label: "Allowed Visits",
        type: "number",
        placeholder: "Enter allowed visits",
        value: warranty.allowedVisits.toString(),
      },
      {
        name: "customerName",
        label: "Customer Name",
        type: "text",
        placeholder: "Enter customer name",
        value: warranty.customerName,
      },
      {
        name: "mobileNumber",
        label: "Mobile Number",
        type: "text",
        placeholder: "Enter mobile number",
        value: warranty.mobileNumber,
      },
      {
        name: "carName",
        label: "Car Name",
        type: "text",
        placeholder: "Enter car name",
        value: warranty.carName,
      },
      {
        name: "numberPlate",
        label: "Number Plate",
        type: "text",
        placeholder: "Enter number plate",
        value: warranty.numberPlate,
      },
      {
        name: "issuedDate",
        label: "Issued Date",
        type: "date",
        placeholder: "Select issued date",
        value: new Date(warranty.issuedDate).toISOString().split("T")[0],
      },
      {
        name: "lastDueDate",
        label: "Last Due Date",
        type: "date",
        placeholder: "Select last due date",
        value: new Date(warranty.lastDueDate).toISOString().split("T")[0],
      },
      {
        name: "notes",
        label: "Notes",
        type: "text",
        placeholder: "Enter notes (optional)",
        value: warranty.notes || "",
      },
    ]);
    setEditWarrantyId(warranty._id);
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
    if (!editWarrantyId) {
      console.error("❌ No warranty ID for editing");
      return;
    }

    const data = editFields.reduce((acc, field) => {
      acc[field.name] =
        field.name === "duration" ||
        field.name === "cost" ||
        field.name === "allowedVisits"
          ? Number(field.value)
          : field.name === "issuedDate" || field.name === "lastDueDate"
          ? new Date(field.value)
          : field.value;
      return acc;
    }, {} as Record<string, string | number | Date>);

    try {
      const res = await instance.put(`/api/warranties/${editWarrantyId}`, data);
      setWarranties((prev) =>
        prev.map((warranty) =>
          warranty._id === res.data._id ? res.data : warranty
        )
      );
      console.log("✅ Warranty updated:", res.data);
    } catch (error) {
      console.error("❌ Error updating warranty:", error);
      throw error;
    }
  };

  const handleDelete = async (warranty: Warranty) => {
    try {
      await instance.delete(`/api/warranties/${warranty._id}`);
      setWarranties((prev) => prev.filter((item) => item._id !== warranty._id));
      console.log("✅ Warranty deleted:", warranty._id);
    } catch (error) {
      console.error("❌ Error deleting warranty:", error);
    }
  };

  return {
    warranties,
    headers,
    fetchWarranties,
    prepareEdit,
    handleDelete,
    editFields,
    handleEditInputChange,
    handleEditSubmit,
    setWarranties,
  };
};

export default useWarranty;
