export interface Service {
  serviceName: string;
  price: string;
}

export interface Product {
  productName: string;
  price: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
}

export interface Vehicle {
  id: string;
  model: string;
  regNo: string;
  brand: string;
  customerId: string;
}
export interface newVehicle {
  model: string;
  regNo: string;
  brand: string;
  customerId: string;
}
