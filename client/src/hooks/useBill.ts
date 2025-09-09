import { useState, useEffect } from "react";
import instance from "../axios/axios"; // axios instance
import type { Service } from "../types/WorkOrder";

const useBill = () => {
  const [fields, setFields] = useState([
    {
      name: "name",
      label: "Customer Name",
      type: "select", // ✅ change to select
      placeholder: "Select customer",
      value: "",
      options: [],
    },
    {
      name: "phone",
      label: "Phone Number",
      type: "text",
      placeholder: "Enter number",
      value: "",
    },
    {
      name: "vehicleNumber",
      label: "Vehicle Number",
      type: "text",
      placeholder: "Enter vehicle number",
      value: "",
    },
    {
      name: "serviceBrand",
      label: "Vehicle Make and Model",
      type: "text",
      placeholder: "Enter vehicle model & brand",
      value: "",
    },

    // service details
    {
      name: "serviceName",
      label: "Service Name",
      type: "select", 
      placeholder: "Select a service",
      value: "",
      options: [],
    },
    {
      name: "serviceWarranty",
      label: "Service Warranty",
      type: "text",
      placeholder: "Enter warranty in months",
      value: "",
    },
    {
      name: "workerName",
      label: "Worker Name",
      type: "text",
      placeholder: "Enter worker name",
      value: "",
    },
    {
      name: "serviceDescription",
      label: "Service Description",
      type: "text",
      placeholder: "Enter service details",
      value: "",
    },

    // price details
    {
      name: "serviceAmount",
      label: "Service amount",
      type: "text",
      placeholder: "Enter Service amount",
      value: "",
    },
    {
      name: "taxAmount",
      label: "Tax",
      type: "text",
      placeholder: "Enter Tax amount",
      value: "",
    },
    {
      name: "additionalCharge",
      label: "Additional Charge",
      type: "text",
      placeholder: "Enter Additional charge",
      value: "",
    },
    {
      name: "additionalChargeFor",
      label: "Additional Charge for",
      type: "text",
      placeholder: "Additional charge for :",
      value: "",
    },
    {
      name: "discountAmount",
      label: "Discount",
      type: "text",
      placeholder: "Enter Discount amount",
      value: "",
    },
    {
      name: "finalAmount",
      label: "Final amount have to pay",
      type: "text",
      placeholder: "Final amount",
      value: "",
    },
  ]);

  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  // ✅ Fetch services
  const fetchServices = async () => {
    try {
      const res = await instance.get("/api/service");
      setServices(res.data);

      setFields((prev) =>
        prev.map((f) =>
          f.name === "serviceName"
            ? {
                ...f,
                options: res.data.map((s: any) => ({
                  label: s.serviceName,
                  value: s._id,
                  price: s.price,
                })),
              }
            : f
        )
      );
    } catch (err) {
      console.error("Failed to fetch services:", err);
    }
  };

  // ✅ Fetch customers
  const fetchCustomers = async () => {
    try {
      const res = await instance.get("/api/customer");
      setCustomers(res.data);

      setFields((prev) =>
        prev.map((f) =>
          f.name === "name"
            ? {
                ...f,
                options: res.data.map((c: any) => ({
                  label: c.name,
                  value: c._id,
                  phone: c.phone,
                })),
              }
            : f
        )
      );
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchCustomers();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Bill Data:", fields);
    // TODO: send to API
  };

  const handleInputChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const newFields = [...fields];
    const field = newFields[index];

    // ✅ Handle customer selection
    if (field.name === "name") {
      const selectedCustomer: any = field.options?.find(
        (opt: any) => opt.value === event.target.value
      );
      if (selectedCustomer) {
        field.value = selectedCustomer.value;

        // auto-fill phone number
       // auto-fill phone number
const phoneIndex = newFields.findIndex((f) => f.name === "phone");
if (phoneIndex !== -1) {
  newFields[phoneIndex].value = selectedCustomer.phone || "";
}

      }
    }
    // ✅ Handle service selection
    else if (field.name === "serviceName") {
      const selectedService: any = field.options?.find(
        (opt: any) => opt.value === event.target.value
      );
      if (selectedService) {
        field.value = selectedService.value;

        // auto-fill service amount
        const serviceAmountIndex = newFields.findIndex(
          (f) => f.name === "serviceAmount"
        );
        if (serviceAmountIndex !== -1) {
          newFields[serviceAmountIndex].value = selectedService.price.toString();
        }
      }
    } else {
      field.value = event.target.value;
    }

    setFields(newFields);
  };

  return {
    fields,
    handleSubmit,
    handleInputChange,
    services,
    customers,
  };
};

export default useBill;
