import { useState } from "react";
import type { ServiceData } from "../types/ServiceType";
import { extractData } from "../utils/helper";
import instance from "../axios/axios";
import { toast } from "react-toastify";

const useService = () => {
  const headers = [
    "Service Name",
    "Description",
    "Base Price",
    "Warranty",
    "Status",
    "Actions",
  ];

  const [services, setServices] = useState<ServiceData[]>([]);
  const [service, setService] = useState<ServiceData>();
  const fetchService = async (id: string) => {
    const response = await instance.get(`/api/service/${id}`);
    console.log("service response", response.data);
    setService(response.data);
  };
  const fetchServices = async () => {
    const response = await instance.get("/api/service");
    console.log("service response", response.data);
    setServices(response.data);
  };

  const initialFields = [
    {
      name: "serviceName",
      label: "Service Name",
      type: "text",
      placeholder: "Enter Service name",
      value: "",
    },
    {
      name: "price",
      label: "Service Price",
      type: "number",
      placeholder: "Enter Service price",
      value: "",
    },
    {
      name: "description",
      label: "Service Description",
      type: "text",
      placeholder: "Enter Service Details",
      value: "",
    },
    {
      name: "warranty",
      label: "Service Warranty ",
      type: "text",
      placeholder: "Enter Service Warranty in months",
      value: "",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      placeholder: "Select status",
      value: "true",
    },
  ];

  // For create form
  const [createFields, setCreateFields] = useState(initialFields);
  const handleCreateInputChange = (index: number, event: any) => {
    const newFields = [...createFields];
    newFields[index].value = event.target.value;
    setCreateFields(newFields);
  };
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawPayload = extractData(createFields);
    const payload = {
      serviceName: rawPayload.serviceName,
      price: Number(rawPayload.price),
      description: rawPayload.description,
      warranty: rawPayload.warranty,
      status: rawPayload.status === "true",
    };

    try {
      const res = await instance.post("/api/service", payload);
      toast.success("Service created successfully!");
      setServices((prev) => [...prev, res.data]);
      setCreateFields(initialFields); // Reset form
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create service");
      console.error("Error submitting form:", error);
    }
  };

  // For edit modal
  const [editFields, setEditFields] = useState(initialFields);
  const [editingId, setEditingId] = useState<string | null>(null);
  const handleEditInputChange = (index: number, event: any) => {
    const newFields = [...editFields];
    newFields[index].value = event.target.value;
    setEditFields(newFields);
  };
  const prepareEdit = (item: ServiceData) => {
    setEditFields([
      {
        name: "serviceName",
        label: "Service Name",
        type: "text",
        placeholder: "Enter Service name",
        value: item.serviceName || "",
      },
      {
        name: "price",
        label: "Service Price",
        type: "number",
        placeholder: "Enter Service price",
        value: item.price.toString() || "",
      },
      {
        name: "description",
        label: "Service Description",
        type: "text",
        placeholder: "Enter Service Details",
        value: item.description || "",
      },
      {
        name: "warranty",
        label: "Service Warranty ",
        type: "text",
        placeholder: "Enter Service Warranty in months",
        value: item.warranty || "",
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        placeholder: "Select status",
        value: item.status ? "true" : "false",
      },
    ]);
    setEditingId(item._id);
  };
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawPayload = extractData(editFields);
    const payload = {
      serviceName: rawPayload.serviceName,
      price: Number(rawPayload.price),
      description: rawPayload.description,
      warranty: rawPayload.warranty,
      status: rawPayload.status === "true",
    };

    try {
      const res = await instance.patch(`/api/service/${editingId}`, payload);
      toast.success("Service updated successfully!");
      setServices((prev) =>
        prev.map((s) => (s._id === editingId ? res.data : s))
      );
      setEditingId(null);
      setEditFields(initialFields); // Reset edit fields
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update service");
      console.error("Error updating service:", error);
    }
  };

  const handleDelete = async (item: ServiceData) => {
    console.log("Delete clicked for:", item);
    await instance.delete(`/api/service/${item._id}`);
    setServices((prev) => prev.filter((service) => service._id !== item._id));
  };

  return {
    services,
    service,
    headers,
    setServices,
    fetchServices,
    fetchService,
    prepareEdit,
    handleDelete,
    createFields,
    handleCreateInputChange,
    handleCreateSubmit,
    editFields,
    handleEditInputChange,
    handleEditSubmit,
  };
};
export default useService;
