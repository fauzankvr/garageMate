import { useEffect, useState } from "react";
import useWarranty from "../hooks/useWarranty";
import UserActions from "../components/layout/headers/UserActions";
import Table from "../components/ui/Table";
import Sidebar from "../components/layout/Sidebar";
import InputField from "../components/common/input/input";
import type { Warranty } from "../types/Warranty";
import WarrantyForm from "../components/ui/WarrantyForm";
import { usePasswordVerification } from "../hooks/usePasswordVerification";

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
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Initialize the password verification hook
  const { PasswordModal, openPasswordModal, closePasswordModal } =
    usePasswordVerification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchWarranties();
        setEditError(null);
      } catch (error: any) {
        setEditError(
          error.response?.data?.message ||
            "Error fetching warranties. Please try again."
        );
      }
    };
    fetchData();
  }, [fetchWarranties]);

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

  // EDIT - Requires password verification
  const onEdit = (item: Warranty) => {
    openPasswordModal(() => {
      prepareEdit(item);
      setEditError(null);
      setIsEditModalOpen(true);
      closePasswordModal();
    });
  };

  // DELETE - Password BEFORE confirmation
  const onDelete = (item: Warranty) => {
    // First open password modal
    openPasswordModal(() => {
      // After password verification, show confirmation
      const shouldDelete = window.confirm(
        `Are you sure you want to delete the warranty for ${item.customerName}?\n\nVehicle: ${item.numberPlate}\nPackage: ${item.packageName}\nDuration: ${item.duration} months\n\nThis action cannot be undone.`
      );

      if (shouldDelete) {
        // Proceed with actual delete
        handleDelete(item)
          .then(() => {
            setEditError(null);
            closePasswordModal();
          })
          .catch((error: any) => {
            setEditError(
              error.response?.data?.message ||
                "Error deleting warranty. Please try again."
            );
          });
      } else {
        closePasswordModal();
      }
    });
  };

  // ADD - NO PASSWORD REQUIRED
  const openAddModal = () => {
    // Direct modal open without password
    setIsAddModalOpen(true);
    setEditError(null);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditError(null);
    setIsEditLoading(false);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setEditError(null);
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
      setEditError(
        error.response?.data?.message || "Failed to update warranty"
      );
    } finally {
      setIsEditLoading(false);
    }
  };

  // Filter warranties based on search query
  const filteredWarranties = warranties.filter((warranty) =>
    warranty.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const data: React.ReactNode[][] = filteredWarranties.map((item: Warranty) => {
    const actionCell = (
      <div key={`actions-${item._id}`} className="space-x-2">
        <button
          onClick={() => onEdit(item)}
          className="text-blue-500 hover:underline disabled:opacity-50"
          disabled={isEditLoading}
          title="Edit warranty (requires password)"
          aria-label={`Edit warranty for ${item.numberPlate}`}
        >
          Edit
        </button>
        <span className="text-gray-400">|</span>
        <button
          onClick={() => onDelete(item)}
          className="text-red-500 hover:underline disabled:opacity-50"
          disabled={isEditLoading}
          title="Delete warranty (password required before confirmation)"
          aria-label={`Delete warranty for ${item.numberPlate}`}
        >
          Delete
        </button>
      </div>
    );

    return [
      item.packageName,
      `${item.duration} months`,
      `₹${item.cost.toFixed(2)}`,
      item.allowedVisits.toString(),
      item.customerName,
      item.numberPlate,
      new Date(item.issuedDate).toLocaleDateString(),
      new Date(item.lastDueDate).toLocaleDateString(),
      actionCell,
    ];
  });

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
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <InputField
              name="search"
              type="text"
              value={searchQuery}
              placeholder="Enter customer name..."
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64"
            />
            <div className="flex space-x-2">
              <UserActions />
              <button
                onClick={openAddModal}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                aria-label="Add new warranty (no password required)"
              >
                Add New Warranty
              </button>
            </div>
          </div>
        </div>

        {editError && (
          <div
            className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg text-sm border-l-4 border-red-500"
            role="alert"
          >
            {editError}
          </div>
        )}

        {filteredWarranties.length === 0 && (
          <div className="p-4 text-center text-gray-500 bg-white rounded-lg shadow">
            {searchQuery
              ? `No warranties found for "${searchQuery}".`
              : "No warranties available. Add your first warranty!"}
          </div>
        )}

        {filteredWarranties.length > 0 && (
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <Table headers={headers} data={data} />
          </div>
        )}

        {/* Render Password Modal - Only for Edit/Delete */}
        <PasswordModal />

        {/* Edit Modal - Requires password to open */}
        {isEditModalOpen && (
          <div
            className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
            role="dialog"
            aria-labelledby="edit-warranty-title"
            aria-modal="true"
          >
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 id="edit-warranty-title" className="text-xl font-bold">
                  Edit Warranty
                </h2>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                  disabled={isEditLoading}
                  aria-label="Close edit modal"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {editError && (
                <div
                  className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded border border-red-200"
                  role="alert"
                >
                  {editError}
                </div>
              )}

              {/* Visual indicator for edit operations */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <svg
                  className="w-4 h-4 inline mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Password verification was required to edit this warranty.
              </div>

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
                      {field.label}{" "}
                      {field.name !== "notes" && (
                        <span className="text-red-500">*</span>
                      )}
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
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition disabled:opacity-50"
                    disabled={isEditLoading}
                    aria-label="Cancel edit"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center"
                    disabled={isEditLoading}
                    aria-busy={isEditLoading}
                  >
                    {isEditLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Modal - NO PASSWORD REQUIRED */}
        {isAddModalOpen && (
          <div
            className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
            role="dialog"
            aria-labelledby="add-warranty-title"
            aria-modal="true"
          >
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 id="add-warranty-title" className="text-xl font-bold">
                  Add New Warranty
                </h2>
                <button
                  onClick={closeAddModal}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                  aria-label="Close add modal"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Visual indicator for add operations */}
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                <svg
                  className="w-4 h-4 inline mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                No password required to add new warranties.
              </div>

              <WarrantyForm
                setWarranties={setWarranties}
                onSuccess={closeAddModal}
              />
              <div className="flex justify-end mt-4">
                {/* <button
                  type="button"
                  onClick={closeAddModal}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Cancel
                </button> */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Warranties;
