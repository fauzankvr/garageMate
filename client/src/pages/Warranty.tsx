import { useEffect, useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import useWarranty from "../hooks/useWarranty";
import UserActions from "../components/layout/headers/UserActions";
import Table from "../components/ui/Table";
import Sidebar from "../components/layout/Sidebar";
// import InputField from "../components/common/input/input";
import instance from "../axios/axios";
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
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Password modal states
  const [passwordModalOpen, setPasswordModalOpen] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<{
    type: "edit" | "delete";
    item?: Warranty;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
  }, []); // Empty dependency array to prevent infinite loop

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

  // Handle password submission
  const handlePasswordSubmit = async () => {
    if (!password.trim() || isPasswordSubmitting) {
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
        setPasswordError(null);

        if (pendingAction?.type === "edit" && pendingAction.item) {
          prepareEdit(pendingAction.item);
          setEditError(null);
          setIsEditModalOpen(true);
        } else if (pendingAction?.type === "delete" && pendingAction.item) {
          const shouldDelete = window.confirm(
            `Are you sure you want to delete the warranty for ${pendingAction.item.customerName}?\n\nVehicle: ${pendingAction.item.numberPlate}\nPackage: ${pendingAction.item.packageName}\nDuration: ${pendingAction.item.duration} months\n\nThis action cannot be undone.`
          );

          if (shouldDelete) {
            try {
              await handleDelete(pendingAction.item);
              setEditError(null);
              // Refresh warranties after successful deletion
              await fetchWarranties();
            } catch (error: any) {
              setEditError(
                error.response?.data?.message ||
                  "Error deleting warranty. Please try again."
              );
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

  // EDIT - Requires password verification
  const onEdit = (item: Warranty) => {
    setPendingAction({ type: "edit", item });
    setPasswordModalOpen(true);
    setPassword("");
    setPasswordError(null);
    setIsPasswordSubmitting(false);
  };

  // DELETE - Password BEFORE confirmation
  const onDelete = (item: Warranty) => {
    setPendingAction({ type: "delete", item });
    setPasswordModalOpen(true);
    setPassword("");
    setPasswordError(null);
    setIsPasswordSubmitting(false);
  };

  // ADD - NO PASSWORD REQUIRED
  const openAddModal = () => {
    setIsAddModalOpen(true);
    setEditError(null);
  };

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
      // Refresh warranties after successful edit
      await fetchWarranties();
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
          disabled={isEditLoading || isPasswordSubmitting}
          title="Edit warranty (requires password)"
          aria-label={`Edit warranty for ${item.numberPlate}`}
        >
          Edit
        </button>
        <span className="text-gray-400">|</span>
        <button
          onClick={() => onDelete(item)}
          className="text-red-500 hover:underline disabled:opacity-50"
          disabled={isEditLoading || isPasswordSubmitting}
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
      new Date(item.issuedDate).toLocaleDateString("en-GB"),
      new Date(item.lastDueDate).toLocaleDateString("en-GB"),
      actionCell,
    ];
  });

  // // Show loading state
  // if (warranties.length === 0 && !editError) {
  //   return (
  //     <div className="flex min-h-screen bg-gray-100 items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
  //         <p className="text-gray-600">Loading warranties...</p>
  //       </div>
  //     </div>
  //   );
  // }

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
            {/* Search Input - Use native input to avoid InputField issues */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter customer name..."
              className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isPasswordSubmitting}
            />
            <div className="flex space-x-2">
              <UserActions />
              <button
                onClick={openAddModal}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:bg-gray-400"
                disabled={isPasswordSubmitting}
                aria-label="Add new warranty (no password required)"
              >
                Add New Warranty
              </button>
            </div>
          </div>
        </div>

        {editError && !passwordModalOpen && (
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
                  onClick={() => !isPasswordSubmitting && setShowPassword(!showPassword)}
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
                    {/* Use native input to avoid InputField prop issues */}
                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type as "text" | "number" | "date"}
                      value={field.value}
                      placeholder={field.placeholder}
                      onChange={(e) => {
                        handleEditInputChange(index, e);
                        setEditError(null);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={isEditLoading}
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
                  disabled={isPasswordSubmitting}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Warranties;