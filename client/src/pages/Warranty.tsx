import { useEffect, useState } from "react";
import useWarranty from "../hooks/useWarranty";
import UserActions from "../components/layout/headers/UserActions";
import Table from "../components/ui/Table";
import Sidebar from "../components/layout/Sidebar";
import InputField from "../components/common/input/input";
import type { Warranty } from "../types/Warranty";
import WarrantyForm from "../components/ui/WarrantyForm";

// Define the Field interface
interface Field {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select";
  placeholder?: string;
  value: string;
  options?: string[];
}

// Define the return type of useWarranty hook
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

const Warranties = () => {
  const {
    warranties,
    headers,
    fetchWarranties,
    prepareEdit,
    handleDelete,
    editFields,
    handleEditInputChange,
    handleEditSubmit,
    setWarranties,
  } = useWarranty() as UseWarrantyReturn;

  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditLoading, setIsEditLoading] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    fetchWarranties();
  }, []);

  const validateEditFields = (): boolean => {
    for (const field of editFields) {
      if (field.name !== "notes" && !field.value.trim()) {
        setEditError(`${field.label} is required`);
        return false;
      }
      if (
        (field.name === "duration" ||
          field.name === "cost" ||
          field.name === "allowedVisits") &&
        Number(field.value) < 0
      ) {
        setEditError(`${field.label} cannot be negative`);
        return false;
      }
      if (field.name === "duration" && Number(field.value) < 1) {
        setEditError("Duration must be at least 1 month");
        return false;
      }
      if (
        field.name === "mobileNumber" &&
        !/^\+?\d{10,15}$/.test(field.value)
      ) {
        setEditError("Please enter a valid mobile number");
        return false;
      }
      if (field.name === "numberPlate" && !/^[A-Z0-9-]+$/.test(field.value)) {
        setEditError("Please enter a valid number plate");
        return false;
      }
      if (field.name === "lastDueDate" && field.value) {
        const issuedDate = editFields.find(
          (f) => f.name === "issuedDate"
        )?.value;
        if (issuedDate && new Date(field.value) < new Date(issuedDate)) {
          setEditError("Last due date must be on or after issued date");
          return false;
        }
      }
    }
    return true;
  };

  const onEdit = (item: Warranty) => {
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
      await handleEditSubmit(e);
      closeEditModal();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update warranty";
      setEditError(errorMessage);
    } finally {
      setIsEditLoading(false);
    }
  };

  const data = warranties.map(
    (item: Warranty) =>
      [
        item.packageName,
        item.duration.toString(),
        item.cost.toString(),
        item.allowedVisits.toString(),
        item.customerName,
        item.numberPlate,
        new Date(item.issuedDate).toLocaleDateString(),
        new Date(item.lastDueDate).toLocaleDateString(),
        <div className="space-x-2" key={`${item._id}-actions`}>
          <button
            onClick={() => onEdit(item)}
            className="text-blue-500 hover:underline"
            disabled={isEditLoading}
            aria-label={`Edit warranty for ${item.numberPlate}`}
          >
            Edit
          </button>
          <span className="text-gray-400">|</span>
          <button
            onClick={() => handleDelete(item)}
            className="text-red-500 hover:underline"
            disabled={isEditLoading}
            aria-label={`Delete warranty for ${item.numberPlate}`}
          >
            Delete
          </button>
        </div>,
      ] as (string | number | JSX.Element)[]
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="hidden md:block bg-white">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col w-full md:w-auto p-4 sm:p-6 lg:p-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            Warranties
          </h1>
          <div className="flex space-x-2">
            <UserActions />
            <button
              onClick={openAddModal}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              aria-label="Add new warranty"
            >
              Add New Warranty
            </button>
          </div>
        </div>
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <Table headers={headers} data={data} />
        </div>
        {isEditModalOpen && (
          <div
            className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
            role="dialog"
            aria-labelledby="edit-warranty-title"
            aria-modal="true"
          >
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
              <h2 id="edit-warranty-title" className="text-xl font-bold mb-4">
                Edit Warranty
              </h2>
              {editError && (
                <div className="text-red-500 text-sm mb-4" role="alert">
                  {editError}
                </div>
              )}
              <form
                onSubmit={handleEditSubmitWithLoading}
                className="space-y-4"
                noValidate
              >
                {editFields.map((field, index) => (
                  <div key={field.name}>
                    <label
                      htmlFor={field.name}
                      className="block text-sm font-medium text-gray-600 mb-1"
                    >
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
                      className="w-full"
                      disabled={isEditLoading}
                      aria-invalid={!!editError}
                      aria-describedby={
                        editError ? `${field.name}-error` : undefined
                      }
                    />
                  </div>
                ))}
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                    disabled={isEditLoading}
                    aria-label="Cancel edit"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
                    disabled={isEditLoading}
                    aria-busy={isEditLoading}
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
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
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
          <div
            className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
            role="dialog"
            aria-labelledby="add-warranty-title"
            aria-modal="true"
          >
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <h2 id="add-warranty-title" className="text-xl font-bold mb-4">
                Add New Warranty
              </h2>
              <WarrantyForm
                setWarranties={setWarranties}
                onSuccess={closeAddModal}
              />
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                  aria-label="Cancel add"
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

export default Warranties;
