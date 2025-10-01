import React, { useState } from "react";
import instance from "../../axios/axios";
import type { Warranty } from "../../types/Warranty";

// Define the Field interface
interface Field {
  name: string;
  label: string;
  type: "text" | "number" | "date";
  placeholder?: string;
  value: string;
  error?: string;
}

// Define the Props interface for WarrantyForm
interface WarrantyFormProps {
  setWarranties: React.Dispatch<React.SetStateAction<Warranty[]>>;
  onSuccess?: () => void;
}

const WarrantyForm: React.FC<WarrantyFormProps> = ({
  setWarranties,
  onSuccess,
}) => {
  const [fields, setFields] = useState<Field[]>([
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
      placeholder: "Enter duration",
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
      placeholder: "Enter visits",
      value: "0",
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
      placeholder: "e.g., +1234567890",
      value: "",
    },
    {
      name: "carName",
      label: "Car Name",
      type: "text",
      placeholder: "e.g., Toyota Camry",
      value: "",
    },
    {
      name: "numberPlate",
      label: "Number Plate",
      type: "text",
      placeholder: "e.g., ABC1234",
      value: "",
    },
    {
      name: "issuedDate",
      label: "Issued Date",
      type: "date",
      placeholder: "Select issued date",
      value: new Date().toISOString().split("T")[0],
    },
    {
      name: "lastDueDate",
      label: "Last Due Date",
      type: "date",
      placeholder: "Select due date",
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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const validateFields = (): boolean => {
    let isValid = true;
    const updatedFields = fields.map((field) => {
      const value = field.value.trim();
      let error = "";

      if (field.name !== "notes" && !value) {
        error = `${field.label} is required`;
        isValid = false;
      } else if (field.name === "duration") {
        const numValue = Number(value);
        if (isNaN(numValue) || numValue < 1) {
          error = "Duration must be at least 1 month";
          isValid = false;
        }
      } else if (field.name === "cost" || field.name === "allowedVisits") {
        const numValue = Number(value);
        if (isNaN(numValue) || numValue < 0) {
          error = `${field.label} cannot be negative`;
          isValid = false;
        }
      } else if (field.name === "mobileNumber" && value) {
        const mobileRegex = /^\+?\d{10,15}$/;
        if (!mobileRegex.test(value)) {
          error = "Valid mobile number (10-15 digits)";
          isValid = false;
        }
      } else if (field.name === "numberPlate" && value) {
        const plateRegex = /^[A-Z0-9-]+$/;
        if (!plateRegex.test(value)) {
          error = "Valid number plate (alphanumeric, hyphens)";
          isValid = false;
        }
      } else if (field.name === "issuedDate" && value) {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          error = "Invalid issued date";
          isValid = false;
        }
      } else if (field.name === "lastDueDate" && value) {
        const date = new Date(value);
        const issuedDate = fields.find((f) => f.name === "issuedDate")?.value;
        if (isNaN(date.getTime())) {
          error = "Invalid last due date";
          isValid = false;
        } else if (issuedDate && new Date(value) < new Date(issuedDate)) {
          error = "Due date must be on/after issued date";
          isValid = false;
        }
      } else if (field.name === "packageName" && value) {
        const packageRegex = /^[A-Za-z\s]+$/;
        if (!packageRegex.test(value)) {
          error = "Package name must be letters and spaces only";
          isValid = false;
        }
      }

      return { ...field, error };
    });

    setFields(updatedFields);
    return isValid;
  };

  const handleInputChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setFields((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], value, error: "" };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateFields()) return;

    setIsLoading(true);

    const data = fields.reduce((acc, field) => {
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
      const res = await instance.post("/api/warranties", data);
      setWarranties((prev: Warranty[]) => [...prev, res.data]);
      console.log("✅ Warranty created:", res.data);
      setFields(
        fields.map((field) => ({
          ...field,
          value:
            field.name === "issuedDate"
              ? new Date().toISOString().split("T")[0]
              : field.name === "allowedVisits"
              ? "0"
              : "",
          error: "",
        }))
      );
      if (onSuccess) onSuccess();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to create warranty";
      setFields((prev) =>
        prev.map((field) => ({
          ...field,
          error: field.name === "packageName" ? errorMessage : field.error,
        }))
      );
      console.error("❌ Error creating warranty:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFields(
      fields.map((field) => ({
        ...field,
        value:
          field.name === "issuedDate"
            ? new Date().toISOString().split("T")[0]
            : field.name === "allowedVisits"
            ? "0"
            : "",
        error: "",
      }))
    );
    if (onSuccess) onSuccess();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 mx-auto bg-white rounded-xl max-w-6xl w-full"
      noValidate
      aria-labelledby="warranty-form-title"
    >
      <h2 id="warranty-form-title" className="sr-only">
        Create New Warranty
      </h2>
      {fields.map((field, index) => (
        <div key={field.name} className="relative">
          <label
            htmlFor={field.name}
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            {field.label}
          </label>
          <input
            id={field.name}
            type={field.type}
            name={field.name}
            value={field.value}
            onChange={(e) => handleInputChange(index, e)}
            placeholder={field.placeholder}
            min={
              field.name === "duration"
                ? 1
                : field.name === "cost" || field.name === "allowedVisits"
                ? 0
                : undefined
            }
            step={
              field.name === "cost"
                ? "0.01"
                : field.name === "duration"
                ? "1"
                : undefined
            }
            className={`w-full border ${
              field.error ? "border-red-500" : "border-gray-300"
            } rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
            disabled={isLoading}
            aria-invalid={!!field.error}
            aria-describedby={field.error ? `${field.name}-error` : undefined}
          />
          {field.error && (
            <p
              id={`${field.name}-error`}
              className="mt-1 text-xs text-red-500"
              role="alert"
            >
              {field.error}
            </p>
          )}
        </div>
      ))}
      <div className="lg:col-span-2 flex justify-end space-x-3">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition disabled:opacity-50 text-sm"
          disabled={isLoading}
          aria-label="Cancel warranty creation"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed text-sm"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin h-4 w-4 mr-1 text-white"
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

export default WarrantyForm;
