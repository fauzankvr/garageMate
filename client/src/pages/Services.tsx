import { useEffect, useState } from "react";
import UserActions from "../components/layout/headers/UserActions";
import Sidebar from "../components/layout/Sidebar";
import Table from "../components/ui/Table";
import useService from "../hooks/useServices";
import InputField from "../components/common/input/input";
import { usePasswordVerification } from "../hooks/usePasswordVerification";

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
  } = useService();

  // State for modals and search
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Initialize the password verification hook
  const {
    PasswordModal,
    openPasswordModal,
    passwordError,
    closePasswordModal,
  } = usePasswordVerification();

  // Simulate API call
  useEffect(() => {
    fetchServices();
  }, []);

  // Modified to open edit modal with password verification
  const onEdit = (item: any) => {
    openPasswordModal(() => {
      prepareEdit(item);
      setIsEditModalOpen(true);
      closePasswordModal(); // Close modal on success
    });
  };

  // Modified to require password verification for deletion
  const onDelete = (item: any) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;

    openPasswordModal(() => {
      handleDelete(item);
      closePasswordModal(); // Close modal on success
    });
  };

  // Close modals
  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  // Handle form submission for editing
  const onSubmitEdit = (e: any) => {
    e.preventDefault();
    handleEditSubmit(e);
    closeEditModal();
  };

  // Handle form submission for creating
  const onSubmitCreate = (e: any) => {
    e.preventDefault();
    handleCreateSubmit(e);
    closeCreateModal();
  };

  // Filter services based on search term
  const filteredServices = services.filter((item) =>
    item.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Table data
  const data = filteredServices.map((item) => [
    item.serviceName,
    item.description,
    item.price,
    item.count || 0,
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        item.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
      key={`status-${item.serviceName}`}
    >
      {item.status ? "Active" : "Inactive"}
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
  ]);

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
          >
            Add New Service
          </button>
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            {services.length === 0 && !searchTerm && (
              <div className="p-4 text-center text-gray-500">
                No services available.
              </div>
            )}
            {filteredServices.length === 0 && searchTerm && (
              <div className="p-4 text-center text-gray-500">
                No services found for "{searchTerm}".
              </div>
            )}
            {passwordError && (
              <div className="p-4 text-center text-red-500">{passwordError}</div>
            )}
            {filteredServices.length > 0 && (
              <Table headers={headers} data={data} />
            )}
          </div>
        </div>

        {/* Render Password Modal */}
        <PasswordModal />

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Edit Service</h2>
              <form onSubmit={onSubmitEdit} className="space-y-4">
                {editFields.map((field, index) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      {field.label}
                    </label>
                    {field.name === "description" ? (
                      <textarea
                        name={field.name}
                        value={field.value}
                        placeholder={field.placeholder}
                        onChange={(e) => handleEditInputChange(index, e)}
                        className="w-full p-2 bg-gray-50 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                      />
                    ) : field.name === "status" ? (
                      <select
                        name={field.name}
                        value={field.value}
                        onChange={(e) => handleEditInputChange(index, e)}
                        className="w-full p-2 bg-gray-50 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    ) : (
                      <InputField
                        label={field.label}
                        name={field.name}
                        type={field.type}
                        value={field.value}
                        placeholder={field.placeholder}
                        onChange={(e) => handleEditInputChange(index, e)}
                        className="w-full"
                      />
                    )}
                  </div>
                ))}
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
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Add New Service</h2>
              <form onSubmit={onSubmitCreate} className="space-y-4">
                {createFields.map((field, index) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      {field.label}
                    </label>
                    {field.name === "description" ? (
                      <textarea
                        name={field.name}
                        value={field.value}
                        placeholder={field.placeholder}
                        onChange={(e) => handleCreateInputChange(index, e)}
                        className="w-full p-2 bg-gray-50 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                      />
                    ) : field.name === "status" ? (
                      <select
                        name={field.name}
                        value={field.value}
                        onChange={(e) => handleCreateInputChange(index, e)}
                        className="w-full p-2 bg-gray-50 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    ) : (
                      <InputField
                        label={field.label}
                        name={field.name}
                        type={field.type}
                        value={field.value}
                        placeholder={field.placeholder}
                        onChange={(e) => handleCreateInputChange(index, e)}
                        className="w-full"
                      />
                    )}
                  </div>
                ))}
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
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                  >
                    Create
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
