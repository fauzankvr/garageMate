import { useState } from "react";

import type { Orders } from "../types/Orders";


const useOrder=()=>{
    const headers = [
  "Service Name",
  "Vehicle Info",
  "Customer Name",
  "Phone",
  "Total Cost",
  "Status",
  "Actions",
];

  const [orders, setOrders] = useState<Orders[]>([]);
    const fetchData = async () => {
          const response:Orders[] = [
  {
    serviceName: "Car Polishing",
    vehicleInfo: "KL 55 KA 1616",
    customerName: "Swathish Sreeraman",
    phone: "+91 987654321",
    totalCost: "5,000 ₹",
    status: "Pending",
  },
  {
    serviceName: "Car Wash",
    vehicleInfo: "KL 55 KA 1616",
    customerName: "Someone else",
    phone: "+91 987654321",
    totalCost: "4,000 ₹",
    status: "Progress",
  },
  {
    serviceName: "Car Polishing",
    vehicleInfo: "KL 55 KA 1616",
    customerName: "Swathish Sreeraman",
    phone: "+91 987654321",
    totalCost: "2,000 ₹",
    status: "Completed",
  },
];
          setOrders(response);
        };
       
        
return{
  orders, 
headers,
setOrders,
fetchData,

}
}
export default useOrder;