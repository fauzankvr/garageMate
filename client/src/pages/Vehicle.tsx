import { useEffect, useState, useCallback } from "react";
import { debounce } from "lodash";
import { Edit, Search, Trash, X, Plus, User, Car } from "lucide-react";
import Table from "../components/ui/Table";
import Sidebar from "../components/layout/Sidebar";
import UserActions from "../components/layout/headers/UserActions";
import instance from "../axios/axios";

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email: string;
}

interface Vehicle {
  _id?: string;
  model: string;
  // year: string;
  // brand: string;
  registration_number: string;
  customerId: string;
  customerName?: string; // Added for display
  serviceCount: number;
  createdAt?: string;
  updatedAt?: string;
}

interface NewCustomer {
  name: string;
  phone: string;
  email: string;
}

const Vehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    model: "",
    // year: "",
    // brand: "",
    registration_number: "",
    customerId: "",
  });
  const [newCustomer, setNewCustomer] = useState<NewCustomer>({
    name: "",
    phone: "",
    email: "",
  });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [customerSearchTerm, setCustomerSearchTerm] = useState<string>("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Fetch vehicles from API
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const response = await instance.get("/api/vehicle");
        console.log("API Response:", response.data);
        const data = response.data.data || response.data;
        setVehicles(Array.isArray(data) ? data : []);
        setFilteredVehicles(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (error: any) {
        console.error("Error fetching vehicles:", error);
        setError("Failed to load vehicles. Please try again.");
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  // Fetch customers for search
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoadingCustomers(true);
        const response = await instance.get("/api/customer");
        console.log("Customer API Response:", response.data);
        const data = response.data.data || response.data;
        setCustomers(Array.isArray(data) ? data : []);
        setFilteredCustomers(Array.isArray(data) ? data : []);
        setLoadingCustomers(false);
      } catch (error: any) {
        console.error("Error fetching customers:", error);
        setError("Failed to load customers. Please try again.");
        setLoadingCustomers(false);
      }
    };
    fetchCustomers();
  }, []);

  // Debounced vehicle search handler
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setFilteredVehicles(
        vehicles.filter((vehicle) => {
          const model = vehicle.model ? vehicle.model.toLowerCase() : "";
          const registration = vehicle.registration_number
            ? vehicle.registration_number.toLowerCase()
            : "";
          const search = term.toLowerCase();
          return model.includes(search) || registration.includes(search);
        })
      );
    }, 300),
    [vehicles]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  // Debounced customer search handler
  const debouncedCustomerSearch = useCallback(
    debounce((term: string) => {
      setFilteredCustomers(
        customers.filter((customer) => {
          const name = customer.name ? customer.name.toLowerCase() : "";
          const phone = customer.phone
            ? customer.phone.replace(/[\s-+]/g, "")
            : "";
          const search = term.toLowerCase();
          return name.includes(search) || phone.includes(search);
        })
      );
    }, 300),
    [customers]
  );

  useEffect(() => {
    debouncedCustomerSearch(customerSearchTerm);
  }, [customerSearchTerm, debouncedCustomerSearch]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle customer selection
  const handleCustomerSelect = (customer: Customer) => {
    setFormData((prev) => ({ ...prev, customerId: customer._id }));
    setCustomerSearchTerm(customer.name);
    setFilteredCustomers([]);
  };

  // Create new customer
  const createCustomer = async () => {
    try {
      const response = await instance.post<Customer>(
        "/api/customer",
        newCustomer
      );
      console.log("Create Customer Response:", response.data);
      setCustomers((prev) => [...prev, response.data]);
      setFilteredCustomers((prev) => [...prev, response.data]);
      setFormData((prev) => ({ ...prev, customerId: response.data._id }));
      setCustomerSearchTerm(response.data.name);
      setNewCustomer({ name: "", phone: "", email: "" });
      setIsCustomerModalOpen(false);
    } catch (error: any) {
      console.error("Error creating customer:", error);
      setError("Failed to create customer. Please try again.");
    }
  };

  // Handle adding a new vehicle
  const handleAddVehicle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.customerId) {
      setError("Please select a customer.");
      return;
    }
    try {
      const response = await instance.post("/api/vehicle", formData);
      console.log("Add Vehicle Response:", response.data);
      if (response.status === 201) {
        const newVehicle = response.data.data;
        setVehicles((prev) => [...prev, newVehicle]);
        setFilteredVehicles((prev) => [...prev, newVehicle]);
        setFormData({
          model: "",
          // year: "",
          // brand: "",
          registration_number: "",
          customerId: "",
        });
        setCustomerSearchTerm("");
        setIsAddModalOpen(false);
      } else {
        console.error("Failed to add vehicle");
        setError("Failed to add vehicle.");
      }
    } catch (error: any) {
      console.error("Error adding vehicle:", error);
      setError("Error adding vehicle. Please try again.");
    }
  };

  // Handle editing a vehicle
  const handleEditVehicle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentVehicle?._id || !formData.customerId) {
      setError("Please select a customer.");
      return;
    }
    try {
      const response = await instance.put(
        `/api/vehicle/${currentVehicle._id}`,
        formData
      );
      console.log("Edit Vehicle Response:", response.data);
      if (response.status === 200) {
        const updatedVehicle = response.data;
        setVehicles((prev) =>
          prev.map((veh) =>
            veh._id === updatedVehicle._id ? updatedVehicle : veh
          )
        );
        setFilteredVehicles((prev) =>
          prev.map((veh) =>
            veh._id === updatedVehicle._id ? updatedVehicle : veh
          )
        );
        setFormData({
          model: "",
          // year: "",
          // brand: "",
          registration_number: "",
          customerId: "",
        });
        setCustomerSearchTerm("");
        setCurrentVehicle(null);
        setIsEditModalOpen(false);
      } else {
        console.error("Failed to update vehicle");
        setError("Failed to update vehicle.");
      }
    } catch (error: any) {
      console.error("Error updating vehicle:", error);
      setError("Error updating vehicle. Please try again.");
    }
  };

  // Handle deleting a vehicle
  const handleDeleteVehicle = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?"))
      return;
    try {
      const response = await instance.delete(`/api/vehicle/${id}`);
      if (response.status === 200) {
        setVehicles((prev) => prev.filter((veh) => veh._id !== id));
        setFilteredVehicles((prev) => prev.filter((veh) => veh._id !== id));
      } else {
        console.error("Failed to delete vehicle");
        setError("Failed to delete vehicle.");
      }
    } catch (error: any) {
      console.error("Error deleting vehicle:", error);
      setError("Error deleting vehicle. Please try again.");
    }
  };

  // Open edit modal
  const openEditModal = (vehicle: Vehicle) => {
    setCurrentVehicle(vehicle);
    setFormData({
      model: vehicle.model,
      // year: vehicle.year,
      // brand: vehicle.brand,
      registration_number: vehicle.registration_number,
      customerId: vehicle.customerId,
    });
    setCustomerSearchTerm(vehicle.customerName || "");
    setIsEditModalOpen(true);
  };

  // Table headers
  const headers = [
    "Model",
    // "Year",
    // "Brand",
    "Registration Number",
    "Customer",
    "Service Count",
    "Status",
    "Actions",
  ];

  // Table data
  const data = filteredVehicles.map((vehicle) => [
    vehicle.model || "N/A",
    // vehicle.year || "N/A",
    // vehicle.brand || "N/A",
    vehicle.registration_number || "N/A",
    <span>
      {vehicle.customerId.name || vehicle.customerId || "N/A"}
    </span>,
    <span
      className={`text-sm font-medium ${
        vehicle.serviceCount === 10
          ? "bg-green-100 text-green-700 rounded-full px-3 py-1"
          : ""
      }`}
    >
      {vehicle.serviceCount === 10 ? "Free" : vehicle.serviceCount ?? 0}
    </span>,
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        vehicle.updatedAt
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      {vehicle.updatedAt ? "Active" : "Inactive"}
    </span>,
    <div className="flex gap-2">
      <button
        onClick={() => openEditModal(vehicle)}
        className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        title="Edit Vehicle"
      >
        <Edit size={16} />
      </button>
      <button
        onClick={() => vehicle._id && handleDeleteVehicle(vehicle._id)}
        className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        title="Delete Vehicle"
      >
        <Trash size={16} />
      </button>
    </div>,
  ]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="hidden md:block w-50 bg-white border-r shadow">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col w-full md:w-auto p-4 sm:p-6 lg:p-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            Vehicles
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Create New Vehicle
            </button>
            <UserActions />
          </div>
        </div>
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by model or registration number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 pl-10"
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={20}
            />
          </div>
        </div>
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          {loading && (
            <div className="p-4 text-center text-gray-500">
              Loading vehicles...
            </div>
          )}
          {error && <div className="p-4 text-center text-red-500">{error}</div>}
          {!loading && !error && filteredVehicles.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              {searchTerm
                ? `No vehicles found for "${searchTerm}".`
                : "No vehicles found."}
            </div>
          )}
          {!loading && !error && filteredVehicles.length > 0 && (
            <Table headers={headers} data={data} />
          )}
        </div>

        {/* Edit Vehicle Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium flex items-center">
                  <Car size={20} className="mr-2" />
                  Edit Vehicle
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleEditVehicle} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-gray-50 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter vehicle model"
                    required
                  />
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Year
                  </label>
                  <input
                    type="text"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-gray-50 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter vehicle year"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-gray-50 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter vehicle brand"
                    required
                  />
                </div> */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    name="registration_number"
                    value={formData.registration_number}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-gray-50 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter registration number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Customer
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customerSearchTerm}
                      onChange={(e) => setCustomerSearchTerm(e.target.value)}
                      className="w-full p-2 bg-gray-50 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search by customer name or phone"
                    />
                    <Search
                      className="absolute right-3 top-2.5 text-gray-400"
                      size={20}
                    />
                  </div>
                  {loadingCustomers && (
                    <div className="text-sm text-gray-500 mt-2">
                      Searching...
                    </div>
                  )}
                  {filteredCustomers.length > 0 && customerSearchTerm && (
                    <div className="mt-2 bg-white border rounded-lg shadow-sm max-h-40 overflow-y-auto">
                      {filteredCustomers.map((customer) => (
                        <div
                          key={customer._id}
                          onClick={() => handleCustomerSelect(customer)}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        >
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-gray-600">
                            {customer.phone}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => setIsCustomerModalOpen(true)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <Plus size={16} className="mr-1" />
                    Create New Customer
                  </button>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Vehicle Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium flex items-center">
                  <Car size={20} className="mr-2" />
                  Create New Vehicle
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddVehicle} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-gray-50 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter vehicle model"
                    required
                  />
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Year
                  </label>
                  <input
                    type="text"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-gray-50 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter vehicle year"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-gray-50 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter vehicle brand"
                    required
                  />
                </div> */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    name="registration_number"
                    value={formData.registration_number}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-gray-50 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter registration number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Customer
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customerSearchTerm}
                      onChange={(e) => setCustomerSearchTerm(e.target.value)}
                      className="w-full p-2 bg-gray-50 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search by customer name or phone"
                    />
                    <Search
                      className="absolute right-3 top-2.5 text-gray-400"
                      size={20}
                    />
                  </div>
                  {loadingCustomers && (
                    <div className="text-sm text-gray-500 mt-2">
                      Searching...
                    </div>
                  )}
                  {filteredCustomers.length > 0 && customerSearchTerm && (
                    <div className="mt-2 bg-white border rounded-lg shadow-sm max-h-40 overflow-y-auto">
                      {filteredCustomers.map((customer) => (
                        <div
                          key={customer._id}
                          onClick={() => handleCustomerSelect(customer)}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        >
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-gray-600">
                            {customer.phone}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => setIsCustomerModalOpen(true)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <Plus size={16} className="mr-1" />
                    Create New Customer
                  </button>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Customer Modal */}
        {isCustomerModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium flex items-center">
                  <User size={20} className="mr-2" />
                  Create New Customer
                </h3>
                <button
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={newCustomer.email}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createCustomer}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vehicles;
