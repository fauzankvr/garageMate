import { useEffect, useState, useCallback, useMemo } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import UserActions from "../components/layout/headers/UserActions";
import Sidebar from "../components/layout/Sidebar";
import Table from "../components/ui/Table";
import useService from "../hooks/useServices";
import InputField from "../components/common/input/input";
import instance from "../axios/axios";

const Services = () => {
  const {
    services,
    headers,
    fetchServices,
    prepareEdit,
    handleDelete,
    createFields,
    handleCreateInputChange,
    handleCreateSubmit,
    editFields,
    handleEditInputChange,
    handleEditSubmit,
    loading, // Add loading state if available from hook
  } = useService();

  // Memoize fetchServices to prevent infinite re-renders
  const memoizedFetchServices = useCallback(() => {
    fetchServices();
  }, [fetchServices]);

  // State for modals and search
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [passwordModalOpen, setPasswordModalOpen] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    type: "edit" | "delete";
    item?: any;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false); // Prevent multiple initial calls

  // Fixed useEffect with proper dependency management
  useEffect(() => {
    if (!isDataLoaded && !loading) {
      memoizedFetchServices();
      setIsDataLoaded(true);
    }
  }, [isDataLoaded, loading, memoizedFetchServices]);

  // Reset data loaded flag when services change (in case of manual refresh)
  useEffect(() => {
    if (services.length > 0) {
      setIsDataLoaded(true);
    }
  }, [services]);

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
    if (!password.trim()) {
      setPasswordError("Please enter a password");
      return;
    }

    const isValid = await verifyPassword(password);
    if (isValid) {
      setPasswordError(null);
      setPasswordModalOpen(false);
      setPassword("");
      setPendingAction(null); // Clear pending action after success

      if (pendingAction?.type === "edit" && pendingAction.item) {
        prepareEdit(pendingAction.item);
        setIsEditModalOpen(true);
      } else if (pendingAction?.type === "delete" && pendingAction.item) {
        if (window.confirm("Are you sure you want to delete this service?")) {
          await handleDelete(pendingAction.item);
          // Refresh data after successful deletion
          setIsDataLoaded(false);
        }
      }
    } else {
      setPasswordError("Invalid password");
    }
  };

  // Close password modal
  const closePasswordModal = () => {
    setPasswordModalOpen(false);
    setPassword("");
    setPasswordError(null);
    setPendingAction(null);
  };

  // Memoized handlers to prevent unnecessary re-renders
  const onEdit = useCallback((item: any) => {
    setPendingAction({ type: "edit", item });
    setPasswordModalOpen(true);
    setPassword("");
    setPasswordError(null);
  }, []);

  const onDelete = useCallback((item: any) => {
    setPendingAction({ type: "delete", item });
    setPasswordModalOpen(true);
    setPassword("");
    setPasswordError(null);
  }, []);

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setPendingAction(null);
  }, []);

  const closeCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  // Handle form submission for editing with refresh
  const onSubmitEdit = useCallback(
    (e: any) => {
      e.preventDefault();
      handleEditSubmit(e);
      closeEditModal();
      // Refresh data after successful edit
      setTimeout(() => {
        setIsDataLoaded(false);
      }, 1000); // Small delay to allow API to complete
    },
    [handleEditSubmit, closeEditModal]
  );

  // Handle form submission for creating with refresh
  const onSubmitCreate = useCallback(
    (e: any) => {
      e.preventDefault();
      handleCreateSubmit(e);
      closeCreateModal();
      // Refresh data after successful creation
      setTimeout(() => {
        setIsDataLoaded(false);
      }, 1000); // Small delay to allow API to complete
    },
    [handleCreateSubmit, closeCreateModal]
  );

  // Memoize filtered services to prevent recalculation on every render
  const filteredServices = useMemo(() => {
    return services.filter((item) =>
      item.serviceName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [services, searchTerm]);

  // Memoize table data
  const data = useMemo(() => {
    return filteredServices.map((item) => {
      const rowData = [
        item.serviceName || "",
        item.description || "",
        item.price || "",
        ...(item.isOffer ? [item.count || 0] : []),
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            item.isOffer
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700"
          }`}
          key={`isoffer-${item.serviceName}`}
        >
          {item.isOffer ? "Offer" : "Regular"}
        </span>,
        <div className="space-x-2" key={`actions-${item.serviceName}`}>
          <button
            onClick={() => onEdit(item)}
            className="text-blue-500 hover:underline"
          >
            Edit
          </button>
          <span className="text-gray-400">|</span>
          <button
            onClick={() => onDelete(item)}
            className="text-red-500 hover:underline"
          >
            Delete
          </button>
        </div>,
      ];

      if (!item.isOffer) {
        rowData.splice(3, 0, "—");
      }

      return rowData;
    });
  }, [filteredServices, onEdit, onDelete]);

  // Memoize table headers
  const hasAnyOffers = useMemo(() => {
    return filteredServices.some((item) => item.isOffer);
  }, [filteredServices]);

  const tableHeaders = useMemo(() => {
    return hasAnyOffers
      ? headers.map((h) => (h === "Count" ? "Count" : h))
      : headers.map((h) => (h === "Count" ? "" : h));
  }, [headers, hasAnyOffers]);

  // Show loading state
  if (loading && services.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-100 justify-center items-center">
        <div className="text-lg">Loading services...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="hidden md:block w-50 bg-white border-r shadow">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col w-full md:w-auto p-4 sm:p-6 lg:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            Services
          </h1>
          <div className="flex items-center gap-4">
            <InputField
              label="Search Services"
              name="search"
              type="text"
              value={searchTerm}
              placeholder="Search by service name..."
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-xs"
            />
            <UserActions />
          </div>
        </div>

        {/* Table and Add Button */}
        <div className="mb-6">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-black hover:bg-blue-600 text-white px-8 py-3 rounded-full font-semibold transition mb-4"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add New Service"}
          </button>
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            {services.length === 0 && !searchTerm && !loading && (
              <div className="p-4 text-center text-gray-500">
                No services available.
              </div>
            )}
            {filteredServices.length === 0 && searchTerm && !loading && (
              <div className="p-4 text-center text-gray-500">
                No services found for "{searchTerm}".
              </div>
            )}
            {filteredServices.length > 0 && (
              <Table headers={tableHeaders} data={data} />
            )}
          </div>
        </div>

        {/* Password Modal */}
        {passwordModalOpen && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">
                  {pendingAction?.type === "delete"
                    ? "Confirm Delete"
                    : "Confirm Edit"}
                </h3>
                <button
                  onClick={closePasswordModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mb-4 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  disabled={!password.trim()}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit and Create Modals remain the same but with memoized handlers */}
        {/* ... rest of your modal code ... */}

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Edit Service</h2>
              <form onSubmit={onSubmitEdit} className="space-y-4">
                {editFields.map((field, index) => {
                  const updatedField =
                    field.name === "status"
                      ? {
                          ...field,
                          name: "isOffer",
                          label: "Is Offer",
                          value: field.value.toString(),
                        }
                      : field;

                  return (
                    <div key={updatedField.name}>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        {updatedField.label}
                      </label>
                      {updatedField.name === "description" ? (
                        <textarea
                          name={updatedField.name}
                          value={updatedField.value}
                          placeholder={updatedField.placeholder}
                          onChange={(e) => handleEditInputChange(index, e)}
                          className="w-full p-2 bg-gray-50 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={4}
                        />
                      ) : updatedField.name === "isOffer" ? (
                        <select
                          name={updatedField.name}
                          value={updatedField.value}
                          onChange={(e) => handleEditInputChange(index, e)}
                          className="w-full p-2 bg-gray-50 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="true">Yes (Offer)</option>
                          <option value="false">No (Regular)</option>
                        </select>
                      ) : (
                        <InputField
                          label={updatedField.label}
                          name={updatedField.name}
                          type={updatedField.type}
                          value={updatedField.value}
                          placeholder={updatedField.placeholder}
                          onChange={(e) => handleEditInputChange(index, e)}
                          className="w-full"
                        />
                      )}
                    </div>
                  );
                })}
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Modal - similar updates */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Add New Service</h2>
              <form onSubmit={onSubmitCreate} className="space-y-4">
                {createFields.map((field, index) => {
                  const updatedField =
                    field.name === "status"
                      ? {
                          ...field,
                          name: "isOffer",
                          label: "Is Offer",
                          value: field.value.toString(),
                        }
                      : field;

                  return (
                    <div key={updatedField.name}>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        {updatedField.label}
                      </label>
                      {updatedField.name === "description" ? (
                        <textarea
                          name={updatedField.name}
                          value={updatedField.value}
                          placeholder={updatedField.placeholder}
                          onChange={(e) => handleCreateInputChange(index, e)}
                          className="w-full p-2 bg-gray-50 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={4}
                        />
                      ) : updatedField.name === "isOffer" ? (
                        <select
                          name={updatedField.name}
                          value={updatedField.value}
                          onChange={(e) => handleCreateInputChange(index, e)}
                          className="w-full p-2 bg-gray-50 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="true">Yes (Offer)</option>
                          <option value="false">No (Regular)</option>
                        </select>
                      ) : (
                        <InputField
                          label={updatedField.label}
                          name={updatedField.name}
                          type={updatedField.type}
                          value={updatedField.value}
                          placeholder={updatedField.placeholder}
                          onChange={(e) => handleCreateInputChange(index, e)}
                          className="w-full"
                        />
                      )}
                    </div>
                  );
                })}
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={closeCreateModal}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
                  >
                    {loading ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
