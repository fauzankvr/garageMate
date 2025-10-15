import { useState, useCallback } from "react";
import type { ServiceData } from "../types/ServiceType";
import { extractData } from "../utils/helper";
import instance from "../axios/axios";
import { toast } from "react-toastify";

const useService = () => {
  const headers = [
    "Service Name",
    "Description",
    "Base Price",
    "Offer Count",
    "Status",
    "Actions",
  ];

  // Loading states
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [services, setServices] = useState<ServiceData[]>([]);
  const [service, setService] = useState<ServiceData>();

  // Memoized fetch functions to prevent infinite re-renders
  const fetchService = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await instance.get(`/api/service/${id}`);
      setService(response.data);
    } catch (error) {
      console.error("Error fetching service:", error);
      toast.error("Failed to fetch service");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchServices = useCallback(async () => {
    if (loading) return; // Prevent multiple concurrent calls

    setLoading(true);
    try {
      const response = await instance.get("/api/service");
      setServices(response.data || []);
    } catch (error: any) {
      console.error("Error fetching services:", error);
      toast.error(error.response?.data?.message || "Failed to fetch services");
      setServices([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const initialFields = [
    {
      name: "serviceName",
      label: "Service Name",
      type: "text",
      placeholder: "Enter Service name",
      value: "",
      required: true,
    },
    {
      name: "price",
      label: "Service Price",
      type: "number",
      placeholder: "Enter Service price",
      value: "",
      required: true,
      min: 0,
    },
    {
      name: "description",
      label: "Service Description",
      type: "textarea",
      placeholder: "Enter Service Details",
      value: "",
      required: true,
    },
    {
      name: "count",
      label: "Offer Count",
      type: "number",
      placeholder: "Enter offer count (0 for regular service)",
      value: "0",
      min: 0,
    },
    {
      name: "status",
      label: "Is Offer",
      type: "select",
      placeholder: "Select status",
      value: "false",
      options: [
        { value: "true", label: "Yes (Offer)" },
        { value: "false", label: "No (Regular)" },
      ],
    },
  ];

  // For create form
  const [createFields, setCreateFields] = useState(initialFields);
  const handleCreateInputChange = useCallback(
    (
      index: number,
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const newFields = [...createFields];
      newFields[index].value = event.target.value;
      setCreateFields(newFields);
    },
    [createFields]
  );

  const handleCreateSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (createLoading) return; // Prevent multiple submissions

      // Basic validation
      const hasErrors = createFields.some(
        (field) =>
          field.required &&
          (!field.value || field.value.toString().trim() === "")
      );

      if (hasErrors) {
        toast.error("Please fill in all required fields");
        return;
      }

      setCreateLoading(true);
      const rawPayload = extractData(createFields);
      const payload = {
        serviceName: rawPayload.serviceName?.trim(),
        price: Number(rawPayload.price),
        description: rawPayload.description?.trim(),
        warranty: rawPayload.warranty || null,
        count: Number(rawPayload.count) || 0,
        isOffer: rawPayload.status === "true", // Changed from status to isOffer
      };

      try {
        const res = await instance.post("/api/service", payload);
        toast.success("Service created successfully!");
        setServices((prev) => [...prev, res.data]);
        setCreateFields(initialFields); // Reset form
        fetchServices(); // Refresh data
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Failed to create service"
        );
        console.error("Error submitting form:", error);
      } finally {
        setCreateLoading(false);
      }
    },
    [createFields, createLoading, fetchServices]
  );

  // For edit modal
  const [editFields, setEditFields] = useState(initialFields);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEditInputChange = useCallback(
    (
      index: number,
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const newFields = [...editFields];
      newFields[index].value = event.target.value;
      setEditFields(newFields);
    },
    [editFields]
  );

  const prepareEdit = useCallback((item: ServiceData) => {
    const fields = [
      {
        ...initialFields[0],
        value: item.serviceName || "",
      },
      {
        ...initialFields[1],
        value: item.price?.toString() || "",
      },
      {
        ...initialFields[2],
        value: item.description || "",
      },
      {
        ...initialFields[3],
        value: item.count?.toString() || "0",
      },
      {
        ...initialFields[4],
        value: item.isOffer ? "true" : "false", // Use isOffer instead of status
      },
    ];

    setEditFields(fields);
    setEditingId(item._id);
  }, []);

  const handleEditSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (editLoading || !editingId) return;

      // Basic validation
      const hasErrors = editFields.some(
        (field) =>
          field.required &&
          (!field.value || field.value.toString().trim() === "")
      );

      if (hasErrors) {
        toast.error("Please fill in all required fields");
        return;
      }

      setEditLoading(true);
      const rawPayload = extractData(editFields);
      const payload = {
        serviceName: rawPayload.serviceName?.trim(),
        price: Number(rawPayload.price),
        description: rawPayload.description?.trim(),
        warranty: rawPayload.warranty || null,
        count: Number(rawPayload.count) || 0,
        isOffer: rawPayload.status === "true",
      };

      try {
        const res = await instance.patch(`/api/service/${editingId}`, payload);
        toast.success("Service updated successfully!");
        setServices((prev) =>
          prev.map((s) => (s._id === editingId ? res.data : s))
        );
        setEditingId(null);
        setEditFields(initialFields);
        fetchServices(); // Refresh data
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Failed to update service"
        );
        console.error("Error updating service:", error);
      } finally {
        setEditLoading(false);
      }
    },
    [editFields, editLoading, editingId, fetchServices]
  );

  const handleDelete = useCallback(
    async (item: ServiceData) => {
      if (deleteLoading || !item._id) return;

      const confirmed = window.confirm(
        "Are you sure you want to delete this service?"
      );
      if (!confirmed) return;

      setDeleteLoading(true);
      try {
        await instance.delete(`/api/service/${item._id}`);
        toast.success("Service deleted successfully!");
        setServices((prev) =>
          prev.filter((service) => service._id !== item._id)
        );
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Failed to delete service"
        );
        console.error("Error deleting service:", error);
      } finally {
        setDeleteLoading(false);
      }
    },
    [deleteLoading]
  );

  // Reset functions
  const resetCreateForm = useCallback(() => {
    setCreateFields(initialFields);
  }, []);

  const resetEditForm = useCallback(() => {
    setEditFields(initialFields);
    setEditingId(null);
  }, []);

  // Refresh function
  const refreshServices = useCallback(() => {
    fetchServices();
  }, [fetchServices]);

  return {
    services,
    service,
    headers,
    setServices,
    // Loading states
    loading,
    createLoading,
    editLoading,
    deleteLoading,
    // Fetch functions
    fetchServices,
    fetchService,
    refreshServices,
    // Form handlers
    createFields,
    handleCreateInputChange,
    handleCreateSubmit,
    resetCreateForm,
    editFields,
    handleEditInputChange,
    handleEditSubmit,
    prepareEdit,
    resetEditForm,
    // Actions
    handleDelete,
  };
};

export default useService;
