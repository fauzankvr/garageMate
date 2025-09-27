import { useEffect, useState } from "react";
import Table from "../components/ui/Table"; // Adjust import path
import Sidebar from "../components/layout/Sidebar";
import UserActions from "../components/layout/headers/UserActions";
import instance from "../axios/axios";

interface Customer {
  _id?: string;
  name: string;
  phone: string;
  // vehicles: string[];
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
    // vehicles: [],
  });

  // Fetch customers from API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await instance.get("/api/customer");
        const data = response.data;
        setCustomers(data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      } else {
        console.error("Failed to add customer");
      }
    } catch (error) {
      console.error("Error adding customer:", error);
    }
  };

  // Handle editing a customer
  const handleEditCustomer = async () => {
    if (!currentCustomer?._id) return;
    try {
      const response = await instance.put(`/api/customer/${currentCustomer._id}`, formData);
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
      } else {
        console.error("Failed to update customer");
      }
    } catch (error) {
      console.error("Error updating customer:", error);
    }
  };

  // Handle deleting a customer
  const handleDeleteCustomer = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      const response = await instance.delete(`/api/customer/${id}`);
      if (response.status === 200) {
        setCustomers((prev) => prev.filter((cust) => cust._id !== id));
      } else {
        console.error("Failed to delete customer");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  // Open modal for adding or editing
  const openModal = (customer?: Customer) => {
    if (customer) {
      setCurrentCustomer(customer);
      setFormData({
        name: customer.name,
        phone: customer.phone,
        // email: customer.email,
        // vehicles: customer.vehicles || [],
      });
    } else {
      setCurrentCustomer(null);
      setFormData({ name: "", phone: ""});
    }
    setIsModalOpen(true);
  };

  // Table headers
  const headers = ["Name", "Phone",  "Status", "Actions"];

  // Table data
  const data = customers.map((customer) => [
    customer.name,
    customer.phone,
    // <span className="text-blue-600">{customer.email}</span>,
    // <span>{customer.vehicles.length > 0 ? customer.vehicles.join(", ") : "No vehicles"}</span>,
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        customer.updatedAt
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      {customer.updatedAt ? "Active" : "Inactive"}
    </span>,
    <div className="flex space-x-2">
      <button
        className="text-blue-500 text-sm hover:underline"
        onClick={() => openModal(customer)}
      >
        Edit
      </button>
      <button
        className="text-red-500 text-sm hover:underline"
        onClick={() => handleDeleteCustomer(customer._id!)}
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
          <div className="flex space-x-2">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              onClick={() => openModal()}
            >
              Add Customer
            </button>
            <UserActions />
          </div>
        </div>
        <div className="w-full">
          <Table headers={headers} data={data} />
        </div>
      </div>

      {/* Modal for Add/Edit Customer */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {currentCustomer ? "Edit Customer" : "Add Customer"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  required
                />
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  required
                />
              </div> */}
              {/* Note: Vehicles field is not included in the form as it references ObjectIds. 
                 You may want to add a separate mechanism to manage vehicles if needed. */}
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                onClick={currentCustomer ? handleEditCustomer : handleAddCustomer}
              >
                {currentCustomer ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;