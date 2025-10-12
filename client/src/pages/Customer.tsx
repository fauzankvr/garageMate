import { useEffect, useState } from "react";
import Table from "../components/ui/Table";
import Sidebar from "../components/layout/Sidebar";
import UserActions from "../components/layout/headers/UserActions";
import instance from "../axios/axios";
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
  const {
    PasswordModal,
    openPasswordModal,
    // passwordError: verificationError,
    closePasswordModal,
  } = usePasswordVerification();

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

  // Handle adding a new customer
  const handleAddCustomer = async () => {
    try {
      const response = await instance.post("/api/customer", formData);
      if (response.status === 201) {
        const newCustomer = response.data;
        setCustomers((prev) => [...prev, newCustomer]);
        setFormData({ name: "", phone: "" });
        setIsModalOpen(false);
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

  // Handle editing a customer
  const handleEditCustomer = async () => {
    if (!currentCustomer?._id) {
      setError("No customer selected.");
      return;
    }
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
        setFormData({ name: "", phone: "" });
        setCurrentCustomer(null);
        setIsModalOpen(false);
        setError(null);
      } else {
        setError("Failed to update customer.");
      }
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Error updating customer. Please try again."
      );
    }
  };

  // Handle deleting a customer
  const onDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this customer?"))
      return;
    openPasswordModal(async () => {
      try {
        const response = await instance.delete(`/api/customer/${id}`);
        if (response.status === 200) {
          setCustomers((prev) => prev.filter((cust) => cust._id !== id));
          setError(null);
          closePasswordModal();
        } else {
          setError("Failed to delete customer.");
        }
      } catch (error: any) {
        setError(
          error.response?.data?.message ||
            "Error deleting customer. Please try again."
        );
      }
    });
  };

  // Open modal for adding or editing
  const openModal = (customer?: Customer) => {
    openPasswordModal(() => {
      if (customer) {
        setCurrentCustomer(customer);
        setFormData({
          name: customer.name,
          phone: customer.phone,
        });
      } else {
        setCurrentCustomer(null);
        setFormData({ name: "", phone: "" });
      }
      setIsModalOpen(true);
      setError(null);
      closePasswordModal();
    });
  };

  // Table headers
  const headers = ["Name", "Phone", "Status", "Actions"];

  // Filter customers based on search query
  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
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
        className="text-blue-500 text-sm hover:underline"
        onClick={() => openModal(customer)}
      >
        Edit
      </button>
      <button
        className="text-red-500 text-sm hover:underline"
        onClick={() => onDelete(customer._id!)}
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
            {/* Search Input */}
            <div className="w-full sm:w-auto">
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter customer name..."
                className="block w-full sm:w-64 rounded-lg border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 outline-none transition-all"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-4">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                onClick={() => openModal()}
              >
                Add Customer
              </button>
              <UserActions />
            </div>
          </div>
        </div>
        {error && (
          <div
            className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg text-sm"
            role="alert"
          >
            {error}
          </div>
        )}
        {filteredCustomers.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            {searchQuery
              ? `No customers found for "${searchQuery}".`
              : "No customers available."}
          </div>
        )}
        {filteredCustomers.length > 0 && (
          <div className="w-full">
            <Table headers={headers} data={data} />
          </div>
        )}
        {/* Render Password Modal */}
        <PasswordModal />
        {/* Modal for Add/Edit Customer */}
        {isModalOpen && (
          <div
            className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
            role="dialog"
            aria-labelledby="modal-title"
            aria-modal="true"
          >
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2
                id="modal-title"
                className="text-xl font-semibold mb-4"
              >
                {currentCustomer ? "Edit Customer" : "Add Customer"}
              </h2>
              {error && (
                <div
                  className="text-red-500 text-sm mb-4"
                  role="alert"
                >
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    required
                    aria-required="true"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  type="button"
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  onClick={
                    currentCustomer ? handleEditCustomer : handleAddCustomer
                  }
                >
                  {currentCustomer ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;
