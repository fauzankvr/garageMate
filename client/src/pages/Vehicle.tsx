import { useEffect, useState, useCallback } from "react";
import { debounce } from "lodash";
import {
  Edit,
  Search,
  Trash,
  X,
  Plus,
  User,
  Car,
  Eye,
  EyeOff,
  FileText,
} from "lucide-react";
import Table from "../components/ui/Table";
import Sidebar from "../components/layout/Sidebar";
import UserActions from "../components/layout/headers/UserActions";
import instance from "../axios/axios";
import type { AxiosResponse } from "axios";

// Interfaces
interface Customer {
  _id: string;
  name: string;
  phone: string;
}

interface Vehicle {
  _id?: string;
  model: string;
  registration_number: string;
  customerId: string;
  customerName: string;
  serviceCount: number;
  createdAt?: string;
  updatedAt?: string;
}

interface VehicleFormData {
  model: string;
  registration_number: string;
  customerId: string;
  customerName?: string;
}

interface NewCustomer {
  name: string;
  phone: string;
}

interface Service {
  _id: string;
  serviceName: string;
  count: number;
  price: number;
  status: boolean;
  description: string;
}

interface WorkData {
  _id: string;
  services: Service[];
  createdAt: string;
}

interface ApiResponse<T> {
  data: T | T[];
}

const Vehicles = () => {
  // State declarations
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isWorkDataModalOpen, setIsWorkDataModalOpen] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);
  const [workData, setWorkData] = useState<WorkData[]>([]);
  const [formData, setFormData] = useState<VehicleFormData>({
    model: "",
    registration_number: "",
    customerId: "",
    customerName: "",
  });
  const [newCustomer, setNewCustomer] = useState<NewCustomer>({
    name: "",
    phone: "",
  });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [customerSearchTerm, setCustomerSearchTerm] = useState<string>("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingWorkData, setLoadingWorkData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<string | null>(
    null
  );
  const [passwordModalOpen, setPasswordModalOpen] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    type: "edit" | "delete";
    vehicle?: Vehicle;
    id?: string;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Normalize vehicle data
  const normalizeVehicle = (vehicle: any): Vehicle => ({
    ...vehicle,
    customerName: vehicle.customerId?.name || vehicle.customerName || "N/A",
    customerId: vehicle.customerId?._id || vehicle.customerId || "",
  });

  // Fetch vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const response: AxiosResponse<ApiResponse<Vehicle>> =
          await instance.get("/api/vehicle");
        console.log("Vehicles response:", response.data);
        const data = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        const normalizedVehicles = data.map(normalizeVehicle);
        setVehicles(normalizedVehicles);
        setFilteredVehicles(normalizedVehicles);
        setLoading(false);
      } catch (error: any) {
        console.error(
          "Error fetching vehicles:",
          error.response?.data || error
        );
        setError("Failed to load vehicles. Please try again.");
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoadingCustomers(true);
        const response: AxiosResponse<ApiResponse<Customer>> =
          await instance.get("/api/customer");
        console.log("Customers response:", response.data);
        const data = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setCustomers(data);
        setFilteredCustomers(data);
        setLoadingCustomers(false);
      } catch (error: any) {
        console.error(
          "Error fetching customers:",
          error.response?.data || error
        );
        setError("Failed to load customers. Please try again.");
        setLoadingCustomers(false);
      }
    };
    fetchCustomers();
  }, []);

  // Debounced search for vehicles
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setFilteredVehicles(
        vehicles.filter((vehicle) => {
          const model = vehicle.model?.toLowerCase() || "";
          const registration = vehicle.registration_number?.toLowerCase() || "";
          const search = term.toLowerCase();
          return model.includes(search) || registration.includes(search);
        })
      );
    }, 300) as (term: string) => void,
    [vehicles]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  // Debounced search for customers
  const debouncedCustomerSearch = useCallback(
    debounce((term: string) => {
      setFilteredCustomers(
        customers.filter((customer) => {
          const name = customer.name?.toLowerCase() || "";
          const phone = customer.phone?.replace(/[\s-+]/g, "") || "";
          const search = term.toLowerCase();
          return name.includes(search) || phone.includes(search);
        })
      );
    }, 300) as (term: string) => void,
    [customers]
  );

  useEffect(() => {
    debouncedCustomerSearch(customerSearchTerm);
  }, [customerSearchTerm, debouncedCustomerSearch]);

  // Fetch work data
  const fetchWorkData = async (vehicleId: string) => {
    try {
      setLoadingWorkData(true);
      const response: AxiosResponse<ApiResponse<WorkData>> = await instance.get(
        `/api/workorder/vehicle/${vehicleId}`
      );
      console.log("Work data response:", response.data);
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setWorkData(data);
      setIsWorkDataModalOpen(true);
      setLoadingWorkData(false);
      setError(null);
    } catch (error: any) {
      console.error("Error fetching work data:", error.response?.data || error);
      setError("Failed to load work data. Please try again.");
      setLoadingWorkData(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle customer selection
  const handleCustomerSelect = (customer: Customer) => {
    setFormData((prev) => ({
      ...prev,
      customerId: customer._id,
      customerName: customer.name,
    }));
    setCustomerSearchTerm(customer.name);
    setFilteredCustomers([]);
    setError(null);
  };

  // Create customer
  const createCustomer = async () => {
    try {
      const response: AxiosResponse<Customer> = await instance.post(
        "/api/customer",
        newCustomer
      );
      console.log("Create customer response:", response.data);
      const newCustomerData = response.data;
      setCustomers((prev) => [...prev, newCustomerData]);
      setFilteredCustomers((prev) => [...prev, newCustomerData]);
      setFormData((prev) => ({
        ...prev,
        customerId: newCustomerData._id,
        customerName: newCustomerData.name,
      }));
      setCustomerSearchTerm(newCustomerData.name);
      setNewCustomer({ name: "", phone: "" });
      setIsCustomerModalOpen(false);
      setError(null);
    } catch (error: any) {
      console.error("Error creating customer:", error.response?.data || error);
      setError("Failed to create customer. Please try again.");
    }
  };

  // Handle adding a vehicle
  const handleAddVehicle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.customerId) {
      setError("Please select a customer.");
      return;
    }
    try {
      const { customerName, ...apiFormData } = formData;
      const response: AxiosResponse<ApiResponse<Vehicle>> = await instance.post(
        "/api/vehicle",
        apiFormData
      );
      console.log("Add vehicle response:", response.data);
      if (response.status === 201) {
        const newVehicle = normalizeVehicle(response.data.data);
        setVehicles((prev) => [...prev, newVehicle]);
        setFilteredVehicles((prev) => [...prev, newVehicle]);
        setFormData({
          model: "",
          registration_number: "",
          customerId: "",
          customerName: "",
        });
        setCustomerSearchTerm("");
        setIsAddModalOpen(false);
        setError(null);
      } else {
        setError("Failed to add vehicle.");
      }
    } catch (error: any) {
      console.error("Error adding vehicle:", error.response?.data || error);
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
      const { customerName, ...apiFormData } = formData;
      const response: AxiosResponse<Vehicle> = await instance.put(
        `/api/vehicle/${currentVehicle._id}`,
        apiFormData
      );
      console.log("Edit vehicle response:", response.data);
      if (response.status === 200) {
        const updatedVehicle = normalizeVehicle(response.data);
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
          registration_number: "",
          customerId: "",
          customerName: "",
        });
        setCustomerSearchTerm("");
        setCurrentVehicle(null);
        setIsEditModalOpen(false);
        setError(null);
      } else {
        setError("Failed to update vehicle.");
      }
    } catch (error: any) {
      console.error("Error updating vehicle:", error.response?.data || error);
      setError("Error updating vehicle. Please try again.");
    }
  };

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
    if (!password) {
      setPasswordError("Please enter a password");
      return;
    }

    const isValid = await verifyPassword(password);
    if (isValid) {
      setPasswordError(null);
      setPasswordModalOpen(false);
      setPassword("");

      if (pendingAction?.type === "edit" && pendingAction.vehicle) {
        setCurrentVehicle(pendingAction.vehicle);
        setFormData({
          model: pendingAction.vehicle.model,
          registration_number: pendingAction.vehicle.registration_number,
          customerId: pendingAction.vehicle.customerId,
          customerName: pendingAction.vehicle.customerName,
        });
        setCustomerSearchTerm(pendingAction.vehicle.customerName);
        setIsEditModalOpen(true);
        setError(null);
      } else if (pendingAction?.type === "delete" && pendingAction.id) {
        setIsDeleteConfirmOpen(pendingAction.id);
      }
    } else {
      setPasswordError("Invalid password");
    }
  };

  // Open password modal for edit
  const promptForEdit = (vehicle: Vehicle) => {
    setPendingAction({ type: "edit", vehicle });
    setPasswordModalOpen(true);
    setPassword("");
    setPasswordError(null);
  };

  // Open password modal for delete
  const promptForDelete = (id: string) => {
    setPendingAction({ type: "delete", id });
    setPasswordModalOpen(true);
    setPassword("");
    setPasswordError(null);
  };

  // Handle delete vehicle
  const handleDeleteVehicle = (id: string) => {
    promptForDelete(id);
  };

  // Handle view work data
  const handleViewWorkData = (id: string) => {
    fetchWorkData(id);
  };

  const confirmDelete = async () => {
    if (!isDeleteConfirmOpen) return;

    try {
      const response: AxiosResponse = await instance.delete(
        `/api/vehicle/${isDeleteConfirmOpen}`
      );
      console.log("Delete vehicle response:", response.data);
      if (response.status === 200) {
        setVehicles((prev) =>
          prev.filter((veh) => veh._id !== isDeleteConfirmOpen)
        );
        setFilteredVehicles((prev) =>
          prev.filter((veh) => veh._id !== isDeleteConfirmOpen)
        );
        setError(null);
        setIsDeleteConfirmOpen(null);
      } else {
        setError("Failed to delete vehicle.");
      }
    } catch (error: any) {
      console.error("Error deleting vehicle:", error.response?.data || error);
      setError("Error deleting vehicle. Please try again.");
    }
  };

  // Open edit modal
  const openEditModal = (vehicle: Vehicle) => {
    if (!vehicle._id) return;
    promptForEdit(vehicle);
  };

  // Close password modal
  const closePasswordModal = () => {
    setPasswordModalOpen(false);
    setPassword("");
    setPasswordError(null);
    setPendingAction(null);
  };

  // Table headers
  const headers = [
    "Model",
    "Registration Number",
    "Customer",
    "Service Count",
    "Status",
    "Actions",
  ];

  // Work data table headers
  const workDataHeaders = ["#", "Service Name", "Description", "Price", "Date"];

  // Work data table data
 const groupedWorkData = workData.map((data) => ({
   id: data._id,
   rows: data.services.map((service, serviceIndex) => [
     serviceIndex + 1,
     service.serviceName || "N/A",
     service.description || "N/A",
     service.price ? `$${service.price.toFixed(2)}` : "N/A",
     new Date(data.createdAt).toLocaleDateString() || "N/A",
   ]),
 }));


  // Calculate total count
  // const totalCount = workData.reduce((sum, data) => {
  //   return (
  //     sum +
  //     data.services.reduce(
  //       (serviceSum, service) => serviceSum + (service.count || 0),
  //       0
  //     )
  //   );
  // }, 0);

  // Table data
  const data = filteredVehicles.map((vehicle) => [
    vehicle.model || "N/A",
    vehicle.registration_number || "N/A",
    vehicle.customerName || "N/A",
    <span
      className={`text-sm font-medium ${
        vehicle.serviceCount === 10
          ? "bg-green-100 text-green-700 rounded-full px-3 py-1"
          : ""
      }`}
      key={`service-${vehicle._id}`}
    >
      {vehicle.serviceCount === 10 ? "Free" : vehicle.serviceCount ?? 0}
    </span>,
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        vehicle.updatedAt
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-500"
      }`}
      key={`status-${vehicle._id}`}
    >
      {vehicle.updatedAt ? "Active" : "Inactive"}
    </span>,
    <div className="flex gap-2" key={`actions-${vehicle._id}`}>
      <button
        onClick={() => (vehicle._id ? handleViewWorkData(vehicle._id) : null)}
        className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        title="View Work Data"
      >
        <FileText size={16} />
      </button>
      <button
        onClick={() => openEditModal(vehicle)}
        className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        title="Edit Vehicle"
      >
        <Edit size={16} />
      </button>
      <button
        onClick={() => (vehicle._id ? handleDeleteVehicle(vehicle._id) : null)}
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
          {passwordError && (
            <div className="p-4 text-center text-red-500">{passwordError}</div>
          )}
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

        {/* Password Modal */}
        {passwordModalOpen && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Enter Password</h3>
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title={showPassword ? "Hide password" : "Show password"}
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
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Work Data Modal */}
        {isWorkDataModalOpen && (
          <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium flex items-center">
                  <FileText size={20} className="mr-2" />
                  Vehicle Work Data
                </h3>
                <button
                  onClick={() => setIsWorkDataModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              {loadingWorkData && (
                <div className="p-4 text-center text-gray-500">
                  Loading work data...
                </div>
              )}
              {error && (
                <div className="p-4 text-center text-red-500">{error}</div>
              )}
              {!loadingWorkData && !error && workData.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  No work data found for this vehicle.
                </div>
              )}
              {!loadingWorkData && !error && workData.length > 0 && (
                <div className="space-y-4">
                  {groupedWorkData.map((work) => (
                    <div key={work.id} className="mb-6">
                      <h3 className="font-semibold text-gray-700 mb-2">
                        Work Order: {work.id}
                      </h3>
                      <Table headers={workDataHeaders} data={work.rows} />
                    </div>
                  ))}

                  {/* <div className="flex justify-end text-sm font-medium text-gray-700">
                    Total Count: {totalCount}
                  </div> */}
                </div>
              )}
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setIsWorkDataModalOpen(false)}
                  className="py-2 px-4 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this vehicle?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteConfirmOpen(null)}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Vehicle Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center p-4 z-50">
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
          <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center p-4 z-50">
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
          <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center p-4 z-50">
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
