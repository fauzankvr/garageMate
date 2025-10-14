import { useEffect, useState } from "react";
import Table from "../components/ui/Table";
import Sidebar from "../components/layout/Sidebar";
import UserActions from "../components/layout/headers/UserActions";
import instance from "../axios/axios";
import { X } from "lucide-react";
import { usePasswordVerification } from "../hooks/usePasswordVerification";

interface Customer {
  _id?: string;
  name: string;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: "",
    phone: "",
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Initialize the password verification hook
  const { PasswordModal, openPasswordModal, closePasswordModal } =
    usePasswordVerification();

  // Fetch customers from API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await instance.get("/api/customer");
        const data = response.data;
        setCustomers(data);
        setError(null);
      } catch (error: any) {
        console.error("Error fetching customers:", error);
        setError(
          error.response?.data?.message ||
            "Error fetching customers. Please try again."
        );
      }
    };
    fetchCustomers();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  // Handle adding a new customer - NO PASSWORD REQUIRED
  const handleAddCustomer = async () => {
    if (!formData.name?.trim() || !formData.phone?.trim()) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      const response = await instance.post("/api/customer", formData);
      if (response.status === 201) {
        const newCustomer = response.data;
        setCustomers((prev) => [...prev, newCustomer]);
        closeModal();
        setError(null);
      } else {
        setError("Failed to add customer.");
      }
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Error adding customer. Please try again."
      );
    }
  };

  // Handle editing a customer - REQUIRES PASSWORD VERIFICATION
  const handleEditCustomer = () => {
    if (!currentCustomer?._id) {
      setError("No customer selected.");
      return;
    }

    // Open password modal for edit operation
    openPasswordModal(async () => {
      try {
        const response = await instance.put(
          `/api/customer/${currentCustomer._id}`,
          formData
        );
        if (response.status === 200) {
          const updatedCustomer = response.data;
          setCustomers((prev) =>
            prev.map((cust) =>
              cust._id === updatedCustomer._id ? updatedCustomer : cust
            )
          );
          closeModal();
          setError(null);
          closePasswordModal();
        } else {
          setError("Failed to update customer.");
        }
      } catch (error: any) {
        setError(
          error.response?.data?.message ||
            "Error updating customer. Please try again."
        );
      }
    });
  };

  // Handle deleting a customer - PASSWORD BEFORE CONFIRMATION
  const onDelete = (customer: Customer) => {
    // First open password modal
    openPasswordModal(() => {
      // After password verification, show detailed confirmation
      const shouldDelete = window.confirm(
        `Are you sure you want to delete customer "${customer.name}"?\n\nPhone: ${customer.phone}\n\nThis action cannot be undone and will affect all related records.`
      );

      if (shouldDelete && customer._id) {
        instance
          .delete(`/api/customer/${customer._id}`)
          .then((response) => {
            if (response.status === 200) {
              setCustomers((prev) =>
                prev.filter((cust) => cust._id !== customer._id)
              );
              setError(null);
              closePasswordModal();
            } else {
              setError("Failed to delete customer.");
            }
          })
          .catch((error: any) => {
            setError(
              error.response?.data?.message ||
                "Error deleting customer. Please try again."
            );
          });
      } else {
        closePasswordModal();
      }
    });
  };

  // Open modal for adding (NO PASSWORD) or editing (WITH PASSWORD)
  const openModal = (customer?: Customer) => {
    if (customer) {
      // EDIT - Requires password verification
      openPasswordModal(() => {
        setCurrentCustomer(customer);
        setFormData({
          name: customer.name,
          phone: customer.phone,
        });
        setIsModalOpen(true);
        setError(null);
        closePasswordModal();
      });
    } else {
      // ADD - No password required, open modal directly
      setCurrentCustomer(null);
      setFormData({ name: "", phone: "" });
      setIsModalOpen(true);
      setError(null);
    }
  };

  // Close modal and reset form
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentCustomer(null);
    setFormData({ name: "", phone: "" });
    setError(null);
  };

  // Validate form data
  const validateForm = (): boolean => {
    if (!formData.name?.trim()) {
      setError("Customer name is required.");
      return false;
    }
    if (!formData.phone?.trim()) {
      setError("Phone number is required.");
      return false;
    }
    if (!/^\+?\d{10,15}$/.test(formData.phone)) {
      setError("Please enter a valid phone number.");
      return false;
    }
    return true;
  };

  // Table headers
  const headers = ["Name", "Phone", "Status", "Actions"];

  // Filter customers based on search query
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery)
  );

  // Table data
  const data = filteredCustomers.map((customer) => [
    customer.name,
    customer.phone,
    <span
      key={`status-${customer._id}`}
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        customer.updatedAt
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      {customer.updatedAt ? "Active" : "Inactive"}
    </span>,
    <div key={`actions-${customer._id}`} className="flex space-x-2">
      <button
        className="text-blue-500 text-sm hover:underline disabled:opacity-50"
        onClick={() => openModal(customer)}
        title="Edit customer (requires password)"
        disabled={false}
      >
        Edit
      </button>
      <button
        className="text-red-500 text-sm hover:underline disabled:opacity-50"
        onClick={() => onDelete(customer)}
        title="Delete customer (password required before confirmation)"
        disabled={false}
      >
        Delete
      </button>
    </div>,
  ]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            Customers
          </h1>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <div className="flex-1 sm:w-64">
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or phone..."
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200"
              />
            </div>
            <div className="flex space-x-2">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                onClick={() => openModal()} // ADD - No password required
                aria-label="Add new customer (no password required)"
              >
                Add Customer
              </button>
              <UserActions />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg text-sm border-l-4 border-red-500">
            {error}
          </div>
        )}

        {filteredCustomers.length === 0 && (
          <div className="p-4 text-center text-gray-500 bg-white rounded-lg shadow">
            {searchQuery
              ? `No customers found for "${searchQuery}".`
              : "No customers available. Add your first customer!"}
          </div>
        )}

        {filteredCustomers.length > 0 && (
          <div className="w-full bg-white rounded-lg shadow overflow-hidden">
            <Table headers={headers} data={data} />
          </div>
        )}

        {/* Render Password Modal - Only for Edit/Delete */}
        <PasswordModal />

        {/* Modal for Add/Edit Customer */}
        {isModalOpen && (
          <div
            className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-labelledby="modal-title"
            aria-modal="true"
          >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2
                  id="modal-title"
                  className="text-xl font-bold text-gray-900"
                >
                  {currentCustomer ? "Edit Customer" : "Add Customer"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm border-l-4 border-red-500">
                  {error}
                </div>
              )}

              {/* Visual indicator for edit operations */}
              {currentCustomer && (
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
                  Password verification required to update customer information.
                </div>
              )}

              {/* Visual indicator for add operations */}
              {/* {!currentCustomer && (
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
                  No password required to add new customers.
                </div>
              )} */}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!validateForm()) return;
                  currentCustomer ? handleEditCustomer() : handleAddCustomer();
                }}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter customer name"
                    required
                    aria-required="true"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter phone number"
                    required
                    aria-required="true"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-lg text-white font-medium transition-colors duration-200 ${
                      currentCustomer
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                    disabled={!formData.name?.trim() || !formData.phone?.trim()}
                  >
                    {currentCustomer
                      ? "Update Customer (Requires Password)"
                      : "Add Customer"}
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

export default Customers;
