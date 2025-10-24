import React, { useState, useEffect } from "react";
import { Search, X, Plus, User, Car } from "lucide-react";
import instance from "../../axios/axios";

// Type definitions remain unchanged
export interface Customer {
  _id: string;
  phone: string;
  name?: string;
  email?: string;
}

export interface Vehicle {
  _id: string;
  model: string;
  registration_number: string;
  serviceCount: number;
  customerId: string;
}

export interface Service {
  _id: string;
  warranty: string;
  status: boolean;
  price: number;
  count: number;
  serviceName: string;
  description: string;
}

export interface Product {
  _id: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface ProductItem {
  productId: string;
  quantity: number;
}

export interface ServiceCharge {
  description?: string;
  price?: number;
  for?: string;
}

export interface NewCustomer {
  name?: string;
  phone: string;
  email?: string;
}

export interface NewVehicle {
  model: string;
  registration_number: string;
}

export interface PaymentDetails {
  method: "cash" | "upi" | "both";
  cashAmount?: number;
  upiAmount?: number;
}

export interface WorkOrder {
  _id?: string;
  customerId: string;
  vehicleId?: string;
  services?: Service[];
  products?: ProductItem[];
  serviceCharges?: ServiceCharge[];
  totalServiceCharge?: number;
  totalProductCost?: number;
  totalAmount?: number;
  status?: "pending" | "paid";
  paymentDetails?: PaymentDetails;
  notes?: string;
  discount?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface WorkOrderFormProps {
  workOrder?: WorkOrder;
  onSave: () => void;
}

const WorkOrderForm: React.FC<WorkOrderFormProps> = ({ workOrder, onSave }) => {
  const isEdit = !!workOrder;

  // Main state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [serviceCharges, setServiceCharges] = useState<ServiceCharge[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    method: "cash",
    cashAmount: 0,
    upiAmount: 0,
  });
  const [notes, setNotes] = useState<string>("");
  const [discount, setDiscount] = useState<string>("");
  const [createdAt, setCreatedAt] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Search and dropdown states
  const [phoneSearch, setPhoneSearch] = useState<string>("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Modal states
  const [showCustomerModal, setShowCustomerModal] = useState<boolean>(false);
  const [showVehicleModal, setShowVehicleModal] = useState<boolean>(false);

  // Loading states
  const [loadingCustomers, setLoadingCustomers] = useState<boolean>(false);
  const [loadingVehicles, setLoadingVehicles] = useState<boolean>(false);

  // Form states for modals
  const [newCustomer, setNewCustomer] = useState<NewCustomer>({
    name: "",
    phone: "",
    email: "",
  });
  const [newVehicle, setNewVehicle] = useState<NewVehicle>({
    model: "",
    registration_number: "",
  });

  // Track whether services have been modified
  const [servicesModified, setServicesModified] = useState<boolean>(false);

  // Fetch services and products on component mount
  useEffect(() => {
    fetchServices();
    fetchProducts();
    if (isEdit && workOrder && !servicesModified) {
      const loadData = async () => {
        try {
          const customerResponse = await instance.get<Customer>(
            `/api/customer/${workOrder.customerId}`
          );
          setSelectedCustomer(customerResponse.data);

          if (workOrder.vehicleId) {
            const vehicleResponse = await instance.get<{ data: Vehicle }>(
              `/api/vehicle/${workOrder.vehicleId}`
            );
            setSelectedVehicle(vehicleResponse.data?.data);
            fetchVehiclesByCustomerId(workOrder.customerId);
          }

          if (!servicesModified) {
            console.log(
              "Loading services from work order:",
              workOrder.services
            );
            setSelectedServices(
              workOrder.services?.filter((s) => !s._id.startsWith("temp-")) ||
                []
            );
            setServiceCharges(workOrder.serviceCharges || []);
          }

          const productResponses = await Promise.all(
            (workOrder.products || []).map((product) =>
              instance.get<Product>(`/api/product/${product.productId}`)
            )
          );
          setSelectedProducts(
            productResponses.map((res, index) => ({
              ...res.data,
              quantity: workOrder.products![index].quantity,
            }))
          );

          setPaymentDetails({
            method: workOrder.paymentDetails?.method || "cash",
            cashAmount: workOrder.paymentDetails?.cashAmount ?? 0,
            upiAmount: workOrder.paymentDetails?.upiAmount ?? 0,
          });

          setNotes(workOrder.notes || "");
          setDiscount(workOrder.discount || "");
          setCreatedAt(workOrder.createdAt?.split("T")[0] || "");
          setUpdatedAt(workOrder.updatedAt || "");
        } catch (error: any) {
          console.error("Error loading work order data:", error);
          alert(`Error loading work order data: ${error.message}`);
        }
      };
      loadData();
    }
  }, [isEdit, workOrder, servicesModified]);

  // API calls
  const searchCustomerByPhone = async (phone: string): Promise<void> => {
    if (phone.length < 5) {
      setCustomers([]);
      return;
    }
    setLoadingCustomers(true);
    try {
      const response = await instance.get<Customer[]>(
        `/api/customer/phone/${phone}`
      );
      setCustomers(response.data);
    } catch (error: any) {
      console.error("Error searching customers:", error);
      setCustomers([]);
      alert(`Error searching customers: ${error.message}`);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchVehiclesByCustomerId = async (
    customerId: string
  ): Promise<void> => {
    setLoadingVehicles(true);
    try {
      const response = await instance.get<{ data: Vehicle[] }>(
        `/api/vehicle?customerId=${customerId}`
      );
      setVehicles(response.data?.data);
    } catch (error: any) {
      console.error("Error fetching vehicles:", error);
      setVehicles([]);
      alert(`Error fetching vehicles: ${error.message}`);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const fetchServices = async (): Promise<void> => {
    try {
      const response = await instance.get<Service[]>("/api/service");
      setServices(response.data);
    } catch (error: any) {
      console.error("Error fetching services:", error);
      alert(`Error fetching services: ${error.message}`);
    }
  };

  const fetchProducts = async (): Promise<void> => {
    try {
      const response = await instance.get<Product[]>("/api/product");
      setProducts(response.data);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      alert(`Error fetching products: ${error.message}`);
    }
  };

  const createCustomer = async (): Promise<void> => {
    if (!newCustomer.phone) {
      alert("Phone number is required.");
      return;
    }
    try {
      const response = await instance.post<Customer>(
        "/api/customer",
        newCustomer
      );
      setSelectedCustomer(response.data);
      setShowCustomerModal(false);
      setNewCustomer({ name: "", phone: "", email: "" });
      alert("Customer created successfully!");
    } catch (error: any) {
      console.error("Error creating customer:", error);
      alert(`Error creating customer: ${error.message}`);
    }
  };

  const createVehicle = async (): Promise<void> => {
    if (!selectedCustomer?._id) {
      alert("Please select a customer first.");
      return;
    }
    try {
      const vehicleData = { ...newVehicle, customerId: selectedCustomer._id };
      const response = await instance.post<{ data: Vehicle }>(
        "/api/vehicle",
        vehicleData
      );
      setSelectedVehicle(response.data.data);
      setVehicles([...vehicles, response.data.data]);
      setShowVehicleModal(false);
      setNewVehicle({
        model: "",
        registration_number: "",
      });
      alert("Vehicle added successfully!");
    } catch (error: any) {
      console.error("Error creating vehicle:", error);
      alert(`Error creating vehicle: ${error.message}`);
    }
  };

  // Calculate discount amount
  const calculateDiscountAmount = (): number => {
    if (!discount) return 0;
    const fixedAmount = parseFloat(discount);
    return isNaN(fixedAmount) ? 0 : fixedAmount;
  };

  const createOrUpdateWorkOrder = async (): Promise<void> => {
    if (!selectedCustomer?._id) {
      alert("Please select a customer.");
      return;
    }

    // Validate serviceCharges
    // const validServiceCharges = serviceCharges.filter(
    //   (charge) => charge.description && charge.price && charge.for
    // );
    // if (serviceCharges.length > 0 && validServiceCharges.length === 0) {
    //   alert(
    //     "Please fill in all service charge fields or remove empty charges."
    //   );
    //   return;
    // }

    // Validate payment details
    if (paymentDetails.method === "both") {
      const totalPaid =
        (paymentDetails.cashAmount ?? 0) + (paymentDetails.upiAmount ?? 0);
      if (totalPaid !== calculateGrandTotal()) {
        alert("Cash amount and UPI amount must sum to the total amount.");
        return;
      }
    }

    // // Map serviceCharges to Service objects
    // const mappedServiceCharges: Service[] = validServiceCharges.map(
    //   (charge) => {
    //     const service: Service = {
    //       _id: `temp-${Date.now()}-${Math.random()}`,
    //       warranty: "N/A",
    //       status: true,
    //       price: charge.price || 0,
    //       count: 1,
    //       serviceName: charge.for || "",
    //       description: charge.description || "",
    //     };
    //     console.log("Mapped service charge:", service);
    //     return service;
    //   }
    // );

  
    const services: Service[] = [...selectedServices];

    // Validate services array
    if (services.some((s) => !s._id || !s.serviceName)) {
      console.warn("Invalid services detected:", services);
      alert("Invalid services detected. Please check your selections.");
      return;
    }

    const products: ProductItem[] = selectedProducts.map((product) => ({
      productId: product._id,
      quantity: product.quantity || 1,
    }));

    const workOrderData: WorkOrder = {
      _id: workOrder?._id,
      customerId: selectedCustomer._id,
      vehicleId: selectedVehicle?._id,
      services,
      products,
      serviceCharges: serviceCharges,
      totalServiceCharge: calculateServiceTotal(),
      totalProductCost: calculateProductTotal(),
      totalAmount: calculateGrandTotal(),
      status: workOrder?.status ?? "pending",
      paymentDetails: {
        method: paymentDetails.method,
        cashAmount: paymentDetails.cashAmount ?? 0,
        upiAmount: paymentDetails.upiAmount ?? 0,
      },
      notes,
      discount,
      createdAt,
      updatedAt: isEdit ? new Date().toISOString() : undefined,
    };

    setIsLoading(true);
    try {
      console.log("Work order data sent:", workOrderData);
      let response;
      if (isEdit && workOrder?._id) {
        response = await instance.put<WorkOrder>(
          `/api/workorder/${workOrder._id}`,
          workOrderData
        );
      } else {
        response = await instance.post<WorkOrder>(
          "/api/workorder",
          workOrderData
        );
      }
      console.log("Backend response:", response.data);
      alert(`Work Order ${isEdit ? "updated" : "created"} successfully!`);
      onSave();
      resetForm();
    } catch (error: any) {
      console.error("Error saving work order:", error);
      alert(
        `Error saving work order: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = (): void => {
    setSelectedCustomer(null);
    setSelectedVehicle(null);
    setSelectedServices([]);
    setServiceCharges([]);
    setSelectedProducts([]);
    setPhoneSearch("");
    setVehicles([]);
    setPaymentDetails({ method: "cash", cashAmount: 0, upiAmount: 0 });
    setNotes("");
    setDiscount("");
    setCreatedAt(new Date().toISOString().split("T")[0]);
    setUpdatedAt("");
    setServicesModified(false);
    setIsLoading(false);
  };

  // Event handlers
  const handleCustomerSelect = (customer: Customer): void => {
    setSelectedCustomer(customer);
    setCustomers([]);
    setPhoneSearch("");
    fetchVehiclesByCustomerId(customer._id);
  };

  const handleVehicleSelect = (vehicle: Vehicle): void => {
    setSelectedVehicle(vehicle);
  };

  const handleServiceSelect = (service: Service): void => {
    if (!selectedServices.find((s) => s._id === service._id)) {
      setSelectedServices([...selectedServices, service]);
      setServicesModified(true);
    }
  };

  const removeService = (serviceId: string): void => {
    console.log("Removing service:", serviceId);
    console.log("Current selectedServices:", selectedServices);
    console.log("Current serviceCharges:", serviceCharges);
    const updatedServices = selectedServices.filter((s) => s._id !== serviceId);
    const updatedServiceCharges = serviceCharges.filter(
      (charge) =>
        charge.for !== serviceId &&
        !selectedServices.some((s) => s._id === charge.for)
    );
    console.log("Updated selectedServices:", updatedServices);
    console.log("Updated serviceCharges:", updatedServiceCharges);
    setSelectedServices(updatedServices);
    setServiceCharges(updatedServiceCharges);
    setServicesModified(true);
  };

  const addServiceCharge = (): void => {
    setServiceCharges([
      ...serviceCharges,
      { description: "", price: 0, for: "" },
    ]);
    setServicesModified(true);
  };

  const updateServiceCharge = (
    index: number,
    field: keyof ServiceCharge,
    value: string | number
  ): void => {
    const updated = serviceCharges.map((charge, i) =>
      i === index ? { ...charge, [field]: value } : charge
    );
    setServiceCharges(updated);
    console.log("Updated service charges:", updated);
    setServicesModified(true);
  };

  const removeServiceCharge = (index: number): void => {
    const updated = serviceCharges.filter((_, i) => i !== index);
    setServiceCharges(updated);
    console.log("Updated service charges:", updated);
    setServicesModified(true);
  };

  const addProduct = (product: Product, quantity: number): void => {
    if (quantity <= 0) return;
    const existingIndex = selectedProducts.findIndex(
      (p) => p._id === product._id
    );
    if (existingIndex >= 0) {
      const updated = [...selectedProducts];
      updated[existingIndex].quantity += quantity;
      setSelectedProducts(updated);
    } else {
      setSelectedProducts([...selectedProducts, { ...product, quantity }]);
    }
  };

  const updateProductQuantity = (productId: string, quantity: number): void => {
    if (quantity <= 0) {
      setSelectedProducts(selectedProducts.filter((p) => p._id !== productId));
    } else {
      setSelectedProducts(
        selectedProducts.map((p) =>
          p._id === productId ? { ...p, quantity } : p
        )
      );
    }
  };

  // Calculations
  const calculateServiceTotal = (): number => {
    const servicePrice = selectedServices.reduce(
      (sum, service) => sum + (service.price ?? 0),
      0
    );
    const chargeTotal = serviceCharges.reduce(
      (sum, charge) => sum + (charge.price ?? 0),
      0
    );
    return servicePrice + chargeTotal;
  };

  const calculateProductTotal = (): number => {
    return selectedProducts.reduce(
      (sum, product) => sum + (product.price ?? 0) * (product.quantity ?? 0),
      0
    );
  };

  const calculateGrandTotal = (): number => {
    const subtotal = calculateServiceTotal() + calculateProductTotal();
    const discountAmount = calculateDiscountAmount();
    return Math.max(0, subtotal - discountAmount);
  };

  return (
    <div className="mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-semibold text-gray-900">
            {isEdit ? "Edit Bill" : "Create Bill"}
          </h1>
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm">
            9
          </div>
        </div>

        {/* Customer & Vehicle Info */}
        <div className="p-6 bg-gray-100">
          <h2 className="text-sm font-medium text-gray-700 mb-4">
            Customer & Vehicle Info
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {selectedCustomer ? (
                <div className="bg-white p-3 rounded border relative">
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                  <div className="text-sm">
                    <div className="font-medium">
                      Name: {selectedCustomer.name || "N/A"}
                    </div>
                    <div>Phone: {selectedCustomer.phone}</div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Search Customer
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter Phone number to search"
                      value={phoneSearch}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setPhoneSearch(e.target.value);
                        searchCustomerByPhone(e.target.value);
                      }}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === "Enter") {
                          searchCustomerByPhone(phoneSearch);
                        }
                      }}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Search
                      className="absolute right-3 top-2.5 text-gray-400"
                      size={16}
                    />
                  </div>

                  {loadingCustomers && (
                    <div className="text-sm text-gray-500 mt-2">
                      Searching...
                    </div>
                  )}

                  {customers.length > 0 && (
                    <div className="mt-2 bg-white border rounded-lg shadow-sm max-h-40 overflow-y-auto">
                      {customers.map((customer) => (
                        <div
                          key={customer._id}
                          onClick={() => handleCustomerSelect(customer)}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        >
                          <div className="font-medium">
                            {customer.name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-600">
                            {customer.phone}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setShowCustomerModal(true)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <Plus size={16} className="mr-1" />
                    Create New Customer
                  </button>
                </div>
              )}
            </div>

            <div>
              {selectedVehicle ? (
                <div className="bg-white p-3 rounded border relative">
                  <button
                    onClick={() => setSelectedVehicle(null)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                  <div className="text-sm">
                    <div className="font-medium">
                      Model: {selectedVehicle.model}
                    </div>
                    <div>Reg No: {selectedVehicle.registration_number}</div>
                    <div className="mt-2">
                      <span
                        className={`inline-block text-sm font-medium ${
                          selectedVehicle.serviceCount === 10
                            ? "bg-green-100 text-green-700 rounded-full px-3 py-1"
                            : "text-gray-700"
                        }`}
                      >
                        Service Count:{" "}
                        {selectedVehicle.serviceCount === 10
                          ? "Free"
                          : selectedVehicle.serviceCount}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Select Vehicle (Optional)
                  </div>
                  {selectedCustomer ? (
                    <div>
                      {loadingVehicles ? (
                        <div className="text-sm text-gray-500">
                          Loading vehicles...
                        </div>
                      ) : vehicles.length > 0 ? (
                        <select
                          onChange={(
                            e: React.ChangeEvent<HTMLSelectElement>
                          ) => {
                            const vehicle = vehicles.find(
                              (v) => v._id === e.target.value
                            );
                            if (vehicle) handleVehicleSelect(vehicle);
                          }}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          defaultValue=""
                        >
                          <option value="">No Vehicle</option>
                          {vehicles.map((vehicle) => (
                            <option key={vehicle._id} value={vehicle._id}>
                              {vehicle.model} - {vehicle.registration_number}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="text-sm text-gray-500">
                          No vehicles found
                        </div>
                      )}

                      <button
                        onClick={() => setShowVehicleModal(true)}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <Plus size={16} className="mr-1" />
                        Add New Vehicle
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      Please select a customer first
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Service Section */}
        <div className="p-6 bg-gray-100 border-t">
          <h2 className="text-sm font-medium text-gray-700 mb-4">Services</h2>

          {selectedServices.length > 0 ? (
            <div className="mb-4">
              {selectedServices.map((service) => (
                <div
                  key={service._id}
                  className="bg-white p-3 rounded border relative mb-2"
                >
                  <button
                    onClick={() => removeService(service._id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                  <div className="text-sm">
                    <div className="font-medium">
                      Name: {service.serviceName}
                    </div>
                    <div>
                      Price: ₹{(service.price ?? 0).toLocaleString("en-IN")}
                    </div>
                    <div>Description: {service.description}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 mb-4">
              No services selected
            </div>
          )}

          <select
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const service = services.find((s) => s._id === e.target.value);
              if (service) handleServiceSelect(service);
              e.target.value = "";
            }}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
            defaultValue=""
          >
            <option value="">Select Service</option>
            {services.map((service) => (
              <option key={service._id} value={service._id}>
                {service.serviceName} - ₹
                {(service.price ?? 0).toLocaleString("en-IN")}
              </option>
            ))}
          </select>

          {/* Service Charges */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Service Charges
            </h3>
            {serviceCharges.map((charge, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Charge Description"
                  value={charge.description || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateServiceCharge(index, "description", e.target.value)
                  }
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={charge.price ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateServiceCharge(
                      index,
                      "price",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-20 px-3 py-2 border rounded-lg text-sm"
                />
                <select
                  value={charge.for || ""}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    updateServiceCharge(index, "for", e.target.value)
                  }
                  className="w-24 px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">Custom</option>
                  {selectedServices.map((service) => (
                    <option key={service._id} value={service._id}>
                      {service.serviceName}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeServiceCharge(index)}
                  className="px-2 py-2 text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            ))}

            <button
              onClick={addServiceCharge}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <Plus size={16} className="mr-1" />
              Add Service Charge
            </button>
          </div>

          <div className="text-sm font-medium">
            Total Service Charge: ₹
            {calculateServiceTotal().toLocaleString("en-IN")}
          </div>
        </div>

        {/* Products Section */}
        <div className="p-6 bg-gray-100 border-t">
          <h2 className="text-sm font-medium text-gray-700 mb-4">Products</h2>

          {selectedProducts.length > 0 ? (
            <div className="mb-4">
              {selectedProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white p-3 rounded border mb-2 relative"
                >
                  <button
                    onClick={() => updateProductQuantity(product._id, 0)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                  <div className="text-sm">
                    <div className="font-medium">
                      Product: {product.productName}
                    </div>
                    <div>Quantity: {product.quantity}</div>
                    <div>
                      Price: ₹{(product.price ?? 0).toLocaleString("en-IN")}
                    </div>
                    <div>
                      Total: ₹
                      {(
                        (product.price ?? 0) * (product.quantity ?? 0)
                      ).toLocaleString("en-IN")}
                    </div>
                    <input
                      type="number"
                      value={product.quantity}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateProductQuantity(
                          product._id,
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="w-20 px-2 py-1 border rounded-lg text-sm mt-2"
                      min="1"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 mb-4">
              No products selected
            </div>
          )}

          <div className="flex gap-4 mb-4">
            <select
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const product = products.find((p) => p._id === e.target.value);
                const quantityInput = document.getElementById(
                  "product-quantity"
                ) as HTMLInputElement | null;
                const quantity = parseInt(quantityInput?.value || "1");
                if (product && quantity > 0) addProduct(product, quantity);
                e.target.value = "";
                if (quantityInput) quantityInput.value = "1";
              }}
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              defaultValue=""
            >
              <option value="">Select Product</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.productName} - ₹
                  {(product.price ?? 0).toLocaleString("en-IN")}
                </option>
              ))}
            </select>

            <input
              id="product-quantity"
              type="number"
              placeholder="Quantity"
              className="w-20 px-3 py-2 border rounded-lg"
              min="1"
              defaultValue="1"
            />

            <button
              onClick={() => {
                const select = document.querySelector(
                  "select"
                ) as HTMLSelectElement | null;
                const product = products.find((p) => p._id === select?.value);
                const quantityInput = document.getElementById(
                  "product-quantity"
                ) as HTMLInputElement | null;
                const quantity = parseInt(quantityInput?.value || "1");
                if (product && quantity > 0) addProduct(product, quantity);
                if (select) select.value = "";
                if (quantityInput) quantityInput.value = "1";
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Add Product
            </button>
          </div>

          <div className="text-sm font-medium">
            Total Product Cost: ₹
            {calculateProductTotal().toLocaleString("en-IN")}
          </div>
        </div>

        {/* Notes, Discount, and Date Section */}
        <div className="p-6 bg-gray-100 border-t">
          <h2 className="text-sm font-medium text-gray-700 mb-4">
            Additional Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Bill Date
              </label>
              <input
                type="date"
                value={createdAt}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreatedAt(e.target.value)
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {isEdit && updatedAt && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Last Updated
                </label>
                <input
                  type="text"
                  value={new Date(updatedAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Notes
              </label>
              <textarea
                placeholder="Enter any additional notes"
                value={notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setNotes(e.target.value)
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Discount
              </label>
              <input
                type="text"
                placeholder="Enter discount (e.g., 10%, 50)"
                value={discount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDiscount(e.target.value)
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Payment Details Section */}
        <div className="p-6 bg-gray-100 border-t">
          <h2 className="text-sm font-medium text-gray-700 mb-4">
            Payment Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Payment Method
              </label>
              <select
                value={paymentDetails.method}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setPaymentDetails({
                    ...paymentDetails,
                    method: e.target.value as "cash" | "upi" | "both",
                  })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="both">Both</option>
              </select>
            </div>

            {paymentDetails.method === "both" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Cash Amount
                  </label>
                  <input
                    type="number"
                    placeholder="Cash Amount"
                    value={paymentDetails.cashAmount ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPaymentDetails({
                        ...paymentDetails,
                        cashAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    UPI Amount
                  </label>
                  <input
                    type="number"
                    placeholder="UPI Amount"
                    value={paymentDetails.upiAmount ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPaymentDetails({
                        ...paymentDetails,
                        upiAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="p-6 bg-gray-50 border-t">
          <h2 className="text-sm font-medium text-gray-700 mb-4">
            Cost Breakdown
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Service Charge:</span>
              <span>₹{calculateServiceTotal().toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Product Cost:</span>
              <span>₹{calculateProductTotal().toLocaleString("en-IN")}</span>
            </div>
            {discount && (
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>
                  ₹{calculateDiscountAmount().toLocaleString("en-IN")}
                </span>
              </div>
            )}
            <div className="flex justify-between font-medium text-base border-t pt-2">
              <span>Total Amount:</span>
              <span>₹{calculateGrandTotal().toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Create/Update Button */}
        <div className="p-6">
          <button
            onClick={createOrUpdateWorkOrder}
            disabled={!selectedCustomer || isLoading}
            className={`w-full py-3 rounded-lg flex items-center justify-center
              ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } 
              text-white disabled:bg-gray-300 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : null}
            {isLoading
              ? "Processing..."
              : isEdit
              ? "Update Old Bill"
              : "Create New Bill"}
          </button>
        </div>
      </div>

      {/* Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium flex items-center">
                <User size={20} className="mr-2" />
                Create New Customer
              </h3>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Customer Name (Optional)"
                value={newCustomer.name || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewCustomer({ ...newCustomer, name: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={newCustomer.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewCustomer({ ...newCustomer, phone: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCustomerModal(false)}
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

      {/* Vehicle Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium flex items-center">
                <Car size={20} className="mr-2" />
                Add New Vehicle
              </h3>
              <button
                onClick={() => setShowVehicleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Vehicle Model"
                value={newVehicle.model}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewVehicle({ ...newVehicle, model: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Registration Number"
                value={newVehicle.registration_number}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewVehicle({
                    ...newVehicle,
                    registration_number: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowVehicleModal(false)}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createVehicle}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Vehicle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrderForm;
