import React, { useState, useEffect } from 'react';
import { Search, X, Plus, User, Car } from 'lucide-react';
import instance from '../../axios/axios';
// import { toast } from 'react-toastify';

// Type definitions
interface Customer {
  _id: string;
  phone: string;
  name: string;
  email: string;
}

interface Vehicle {
  _id: string;
  model: string;
  year: string;
  brand: string;
  registration_number: string;
  costumerId: string;
}

interface Service {
  _id: string;
  warranty: string;
  status: boolean;
  price: number;
  serviceName: string;
  description: string;
}

interface Product {
  _id: string;
  productName: string;
  price: number;
  quantity?: number;
}

interface ExtraCharge {
  description: string;
  amount: number;
  for: string;
}

interface NewCustomer {
  name: string;
  phone: string;
  email: string;
}

interface NewVehicle {
  model: string;
  year: string;
  brand: string;
  registration_number: string;
}

interface WorkOrderData {
  costumerId: string;
  vehicleId: string;
  serviceId?: string;
  productId: string[];
  extraCharges: ExtraCharge[];
  totalServiceCharge: number;
  totalProductCost: number;
  totalAmount: number;
}

// Create axios instance
// Add response interceptor for error handling
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Api Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

const WorkOrderCreator: React.FC = () => {
  // Main state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [extraCharges, setExtraCharges] = useState<ExtraCharge[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  
  // Search and dropdown states
  const [phoneSearch, setPhoneSearch] = useState<string>('');
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
  const [newCustomer, setNewCustomer] = useState<NewCustomer>({ name: '', phone: '', email: '' });
  const [newVehicle, setNewVehicle] = useState<NewVehicle>({ model: '', year: '', brand: '', registration_number: '' });

  // Fetch services and products on component mount
  useEffect(() => {
    fetchServices();
    fetchProducts();
  }, []);

  // API calls
  const searchCustomerByPhone = async (phone: string): Promise<void> => {
    if (phone.length < 10) {
    
      return 
    };
    setLoadingCustomers(true);
    try {
      const response = await instance.get<Customer[]>(`/api/customer?phone=${phone}`);
      setCustomers(response.data);
    } catch (error) {
      console.error('Error searching customers:', error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchVehiclesByCustomerId = async (customerId: string): Promise<void> => {
    setLoadingVehicles(true);
    try {
      const response = await instance.get(`/api/vehicle?costomerId=${customerId}`);
      const vehicles = response.data.data;
      console.log('Fetched vehicles:', vehicles);
      setVehicles(vehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const fetchServices = async (): Promise<void> => {
    try {
      const response = await instance.get<Service[]>('/api/service');
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchProducts = async (): Promise<void> => {
    try {
      const response = await instance.get<Product[]>('/api/product');
      console.log('Fetched products:', response.data);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const createCustomer = async (): Promise<void> => {
    try {
      const response = await instance.post<Customer>('/api/customer', newCustomer);
      setSelectedCustomer(response.data);
      setShowCustomerModal(false);
      setNewCustomer({ name: '', phone: '', email: '' });
    } catch (error) {
      console.error('Error creating customer:', error);
    }
  };

  const createVehicle = async (): Promise<void> => {
    if (!selectedCustomer) return;
    try {
      const vehicleData = { ...newVehicle, costumerId: selectedCustomer._id };
      const response = await instance.post<Vehicle>('/api/vehicle', vehicleData);
      console.log(response.data)
      setSelectedVehicle(response.data);
      setVehicles([...vehicles, response.data]);
      setShowVehicleModal(false);
      setNewVehicle({ model: '', year: '', brand: '', registration_number: '' });
    } catch (error) {
      console.error('Error creating vehicle:', error);
    }
  };

  const createWorkOrder = async (): Promise<void> => {
    if (!selectedCustomer || !selectedVehicle) return;

    const workOrderData: WorkOrderData = {
      costumerId: selectedCustomer._id,
      vehicleId: selectedVehicle._id,
      serviceId: selectedService?._id,
      productId: selectedProducts.map(p => p._id),
      extraCharges,
      totalServiceCharge: calculateServiceTotal(),
      totalProductCost: calculateProductTotal(),
      totalAmount: calculateGrandTotal()
    };

    try {
      const response = await instance.post('/api/work-order', workOrderData);
      console.log(response);
      alert('Work Order created successfully!');
      resetForm();
    } catch (error) {
      console.error('Error creating work order:', error);
        alert('Error creating work order');
    }
  };

  const resetForm = (): void => {
    setSelectedCustomer(null);
    setSelectedVehicle(null);
    setSelectedService(null);
    setSelectedProducts([]);
    setExtraCharges([]);
    setPhoneSearch('');
    setVehicles([]);
  };

  // Event handlers
  const handleCustomerSelect = (customer: Customer): void => {
    setSelectedCustomer(customer);
    setCustomers([]);
    setPhoneSearch('');
    fetchVehiclesByCustomerId(customer._id);
  };

  const handleVehicleSelect = (vehicle: Vehicle): void => {
    setSelectedVehicle(vehicle);
  };

  const handleServiceSelect = (service: Service): void => {
    setSelectedService(service);
  };

  const addExtraCharge = (): void => {
    if (extraCharges.length < 2) {
      setExtraCharges([...extraCharges, { description: '', amount: 0, for: '' }]);
    }
  };

  const updateExtraCharge = (index: number, field: keyof ExtraCharge, value: string | number): void => {
    const updated = extraCharges.map((charge, i) => 
      i === index ? { ...charge, [field]: value } : charge
    );
    setExtraCharges(updated);
  };

  const removeExtraCharge = (index: number): void => {
    setExtraCharges(extraCharges.filter((_, i) => i !== index));
  };

  const addProduct = (product: Product): void => {
    const existingIndex = selectedProducts.findIndex(p => p._id === product._id);
    if (existingIndex >= 0) {
      const updated = [...selectedProducts];
      updated[existingIndex].quantity = (updated[existingIndex].quantity || 0) + 1;
      setSelectedProducts(updated);
    } else {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
  };

  const updateProductQuantity = (productId: string, quantity: number): void => {
    if (quantity <= 0) {
      setSelectedProducts(selectedProducts.filter(p => p._id !== productId));
    } else {
      setSelectedProducts(selectedProducts.map(p => 
        p._id === productId ? { ...p, quantity } : p
      ));
    }
  };

  // Calculations
  const calculateServiceTotal = (): number => {
    const servicePrice = selectedService?.price || 0;
    const extraTotal = extraCharges.reduce((sum, charge) => sum + (parseFloat(charge.amount.toString()) || 0), 0);
    return servicePrice + extraTotal;
  };

  const calculateProductTotal = (): number => {
    return selectedProducts.reduce((sum, product) => sum + (product.price * (product.quantity || 1)), 0);
  };

  const calculateGrandTotal = (): number => {
    return calculateServiceTotal() + calculateProductTotal();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-semibold text-gray-900">
            Create Work Order
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
            {/* Customer Section */}
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
                      Name: {selectedCustomer.name}
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
                          <div className="font-medium">{customer.name}</div>
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

            {/* Vehicle Section */}
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
                    <div>Brand: {selectedVehicle.brand}</div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Select Vehicle
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
                          <option value="">Select Vehicle</option>
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
          <h2 className="text-sm font-medium text-gray-700 mb-4">Service</h2>

          {selectedService ? (
            <div className="bg-white p-3 rounded border relative mb-4">
              <button
                onClick={() => setSelectedService(null)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">
                    Name: {selectedService.serviceName}
                  </div>
                  <div>Base Price: ₹{selectedService.price}</div>
                </div>
                <div>
                  <div>Charge: ₹{selectedService.price}</div>
                  <div>For: {selectedService.serviceName}</div>
                </div>
              </div>
            </div>
          ) : (
            <select
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const service = services.find((s) => s._id === e.target.value);
                if (service) handleServiceSelect(service);
              }}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
              defaultValue=""
            >
              <option value="">Select Service</option>
              {services.map((service) => (
                <option key={service._id} value={service._id}>
                  {service.serviceName} - ₹{service.price}
                </option>
              ))}
            </select>
          )}

          {/* Extra Charges */}
          <div className="mb-4">
            {extraCharges.map((charge, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Charge Description"
                  value={charge.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateExtraCharge(index, "description", e.target.value)
                  }
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={charge.amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateExtraCharge(
                      index,
                      "amount",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-20 px-3 py-2 border rounded-lg text-sm"
                />
                <input
                  type="text"
                  placeholder="For"
                  value={charge.for}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateExtraCharge(index, "for", e.target.value)
                  }
                  className="w-24 px-3 py-2 border rounded-lg text-sm"
                />
                <button
                  onClick={() => removeExtraCharge(index)}
                  className="px-2 py-2 text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            ))}

            {extraCharges.length < 2 && (
              <button
                onClick={addExtraCharge}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <Plus size={16} className="mr-1" />
                Add Charge
              </button>
            )}
          </div>

          <div className="text-sm font-medium">
            Total Service Charge: ₹{calculateServiceTotal()}
          </div>
        </div>

        {/* Products Section */}
        <div className="p-6 bg-gray-100 border-t">
          <h2 className="text-sm font-medium text-gray-700 mb-4">Products</h2>

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
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">
                    Product: {product.productName || "Car Wash Shampoo"}
                  </div>
                  <div>Qty: {product.quantity}</div>
                  <div>Price: ₹{product.price}</div>
                </div>
                <div>
                  <div>
                    Product: {product.productName || "Car Wash Shampoo"}
                  </div>
                  <div>Qty: {product.quantity}</div>
                  <div>Price: ₹{product.price}</div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex gap-4 mb-4">
            <select
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const product = products.find((p) => p._id === e.target.value);
                if (product) addProduct(product);
                e.target.value = "";
              }}
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              defaultValue=""
            >
              <option value="">Select Product</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.productName || "Product"} - ₹{product.price || 109}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Quantity"
              className="w-20 px-3 py-2 border rounded-lg"
              min="1"
              defaultValue="1"
            />

            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
              Add Product
            </button>
          </div>

          <div className="text-sm font-medium">
            Total Product Cost: ₹{calculateProductTotal()}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="p-6 bg-gray-50 border-t">
          <h2 className="text-sm font-medium text-gray-700 mb-4">
            Cost Breakdowns
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Service Charge:</span>
              <span>₹{calculateServiceTotal()}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Product Cost:</span>
              <span>₹{calculateProductTotal()}</span>
            </div>
            <div className="flex justify-between font-medium text-base border-t pt-2">
              <span>Total Amount:</span>
              <span>₹{calculateGrandTotal()}</span>
            </div>
          </div>
        </div>

        {/* Create Button */}
        <div className="p-6">
          <button
            onClick={createWorkOrder}
            disabled={!selectedCustomer || !selectedVehicle}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Create Work Order
          </button>
        </div>
      </div>

      {/* Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                placeholder="Customer Name"
                value={newCustomer.name}
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
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newCustomer.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewCustomer({ ...newCustomer, email: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                placeholder="Year"
                value={newVehicle.year}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewVehicle({ ...newVehicle, year: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Brand"
                value={newVehicle.brand}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewVehicle({ ...newVehicle, brand: e.target.value })
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

export default WorkOrderCreator;