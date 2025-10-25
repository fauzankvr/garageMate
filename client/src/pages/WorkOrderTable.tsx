import {
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { debounce } from "lodash";
import instance from "../axios/axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Search, X, Eye, Download, Edit, Trash, EyeOff } from "lucide-react";
import logoImage from "../assets/logo.png";
import WorkOrderForm, {
  type Service,
  type WorkOrder,
  type Customer,
  type Vehicle,
  type ServiceCharge,
  type PaymentDetails,
} from "../components/ui/CreateWorkOrder";

interface Product {
  _id: string;
  productName: string;
  price: number;
  quantity: number;
}

interface WorkOrderData {
  _id: string;
  serialNumber: string;
  customerId: Customer;
  vehicleId?: Vehicle;
  services: Service[];
  products: {
    productId: Product;
    quantity: number;
    _id?: string;
  }[];
  serviceCharges: ServiceCharge[];
  totalServiceCharge: number;
  totalProductCost: number;
  totalAmount: number;
  status: "pending" | "paid";
  paymentDetails: PaymentDetails;
  notes?: string;
  discount?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface WorkOrderTableProps {
  onRefresh?: () => void;
}

const WorkOrderTable = forwardRef(({ onRefresh }: WorkOrderTableProps, ref) => {
  const [workOrders, setWorkOrders] = useState<WorkOrderData[]>([]);
  const [filteredWorkOrders, setFilteredWorkOrders] = useState<WorkOrderData[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string>("");
  const [currentWorkOrder, setCurrentWorkOrder] =
    useState<WorkOrderData | null>(null);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<
    WorkOrder | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    type: "edit" | "delete";
    order?: WorkOrderData;
    id?: string;
  } | null>(null);
const [showPassword,setShowPassword] = useState(false)

  // Fetch work orders from the API
  const fetchWorkOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await instance.get<{
        success: boolean;
        data: WorkOrderData[];
      }>("/api/workorder");
      console.log("Fetched work orders:", res.data.data);

      const workOrdersData = res.data.data.map((order) => ({
        _id: order._id,
        serialNumber: order.serialNumber ?? "N/A",
        customerId: order.customerId ?? {
          name: "N/A",
          email: "N/A",
          phone: "N/A",
        },
        vehicleId: order.vehicleId,
        services: order.services || [],
        products: order.products || [],
        serviceCharges: order.serviceCharges || [],
        totalServiceCharge: order.totalServiceCharge || 0,
        totalProductCost: order.totalProductCost || 0,
        totalAmount: order.totalAmount || 0,
        status: order.status || "pending",
        paymentDetails: order.paymentDetails || { method: "cash" },
        notes: order.notes || "",
        discount: order.discount || "",
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      }));

      setWorkOrders(workOrdersData);
      setFilteredWorkOrders(workOrdersData);
      onRefresh?.();
    } catch (err: any) {
      console.error("Error fetching work orders:", err);
      setError(
        `Failed to fetch work orders: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch of work orders
  useEffect(() => {
    fetchWorkOrders();
  }, [onRefresh]);

  // Expose refresh method to parent via ref
  useImperativeHandle(ref, () => ({
    refresh: fetchWorkOrders,
  }));

  // Normalize phone number for search
  const normalizePhone = (phone: string) => {
    return phone.replace(/[\s-+]/g, "");
  };

  // Debounced search function for filtering work orders
  const debouncedSearch = useCallback(
    debounce((term: string, start: string, end: string) => {
      setFilteredWorkOrders(
        workOrders.filter((order) => {
          const name = order.customerId.name?.toLowerCase() ?? "";
          const phone = order.customerId.phone
            ? normalizePhone(order.customerId.phone)
            : "";
          const serial = order.serialNumber?.toLowerCase() ?? "";
          const search = term.toLowerCase();
          const normalizedSearch = normalizePhone(term);
          const matchesSearch =
            name.includes(search) ||
            phone.includes(normalizedSearch) ||
            serial.includes(search);

          let matchesDate = true;
          if (start || end) {
            const orderDate = order.createdAt
              ? new Date(order.createdAt)
              : null;
            const startDateObj = start ? new Date(start) : null;
            const endDateObj = end ? new Date(end) : null;

            if (orderDate) {
              if (startDateObj && orderDate < startDateObj) {
                matchesDate = false;
              }
              if (endDateObj) {
                endDateObj.setHours(23, 59, 59, 999);
                if (orderDate > endDateObj) {
                  matchesDate = false;
                }
              }
            } else {
              matchesDate = false;
            }
          }

          return matchesSearch && matchesDate;
        })
      );
    }, 300),
    [workOrders]
  );

  // Trigger search when search term or date range changes
  useEffect(() => {
    debouncedSearch(searchTerm, startDate, endDate);
  }, [searchTerm, startDate, endDate, debouncedSearch]);

  // Clear date filters
  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  // Verify password via API
  const verifyPassword = async (password: string): Promise<boolean> => {
    try {
      const res = await instance.post("/api/customer/verify-password", { password });
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

      if (pendingAction?.type === "edit" && pendingAction.order) {
        editWorkOrder(pendingAction.order);
      } else if (pendingAction?.type === "delete" && pendingAction.id) {
        deleteWorkOrder(pendingAction.id);
      }
    } else {
      setPasswordError("Invalid password");
    }
  };

  // Open password modal for edit
  const promptForEdit = (order: WorkOrderData) => {
    setPendingAction({ type: "edit", order });
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

  // Update work order status
  const updateStatus = async (id: string, newStatus: "pending" | "paid") => {
    try {
      await instance.put(`/api/workorder/${id}`, { status: newStatus });
      setWorkOrders((prev) =>
        prev.map((order) =>
          order._id === id ? { ...order, status: newStatus } : order
        )
      );
      setFilteredWorkOrders((prev) =>
        prev.map((order) =>
          order._id === id ? { ...order, status: newStatus } : order
        )
      );
      alert("Status updated successfully!");
    } catch (err: any) {
      console.error("Error updating status:", err);
      alert(
        `Error updating status: ${err.response?.data?.message || err.message}`
      );
    }
  };

  // Delete work order
  const deleteWorkOrder = async (id: string) => {
    if (!confirm("Are you sure you want to delete this work order?")) return;
    try {
      await instance.delete(`/api/workorder/${id}`);
      setWorkOrders((prev) => prev.filter((order) => order._id !== id));
      setFilteredWorkOrders((prev) => prev.filter((order) => order._id !== id));
      alert("Work Order deleted successfully!");
    } catch (err: any) {
      console.error("Error deleting work order:", err);
      alert(
        `Error deleting work order: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  // Prepare work order for editing
  const editWorkOrder = (order: WorkOrderData) => {
    setSelectedWorkOrder({
      _id: order._id,
      customerId: order.customerId?._id ?? "",
      vehicleId: order.vehicleId?._id,
      services: order.services ?? [],
      products:
        order.products?.map((p) => ({
          productId: p.productId?._id ?? "",
          quantity: p.quantity ?? 0,
        })) ?? [],
      serviceCharges: order.serviceCharges ?? [],
      totalServiceCharge: order.totalServiceCharge ?? 0,
      totalProductCost: order.totalProductCost ?? 0,
      totalAmount: order.totalAmount ?? 0,
      status: order.status ?? "pending",
      paymentDetails: order.paymentDetails ?? { method: "cash" },
      notes: order.notes ?? "",
      discount: order.discount ?? "",
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
    setEditModalOpen(true);
  };

  // Generate PDF invoice
  const generateInvoice = (
    workOrder: WorkOrderData,
    preview: boolean = false
  ) => {
    const doc = new jsPDF({ format: "a4" });

    try {
      doc.addImage(logoImage, "PNG", 13, 6, 40, 40);
    } catch (error) {
      console.error("Error loading logo:", error);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("OZON Detailing & Car Wash", 14, 20);
    }

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("OZON Detailing & Car Wash", 14, 45);
    doc.text("Kolathakkara, Manipuram", 14, 50);
    doc.text("Puthoor (PO), Omassery 673582", 14, 55);
    doc.text("+91-9447405746", 14, 60);
    doc.text("info@ozondetailing.com", 14, 65);

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 180, 20, { align: "right" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice Number: ${workOrder.serialNumber ?? "N/A"}`, 180, 30, {
      align: "right",
    });
    doc.text(
      `Date of Issue: ${
        workOrder.createdAt
          ? new Date(workOrder.createdAt).toLocaleDateString("en-IN")
          : new Date().toLocaleDateString("en-IN")
      }`,
      180,
      35,
      { align: "right" }
    );

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Payment Method: ${workOrder.paymentDetails?.method ?? "N/A"}`,
      14,
      105
    );

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 14, 80);
    doc.setFont("helvetica", "normal");
    doc.text(workOrder.customerId?.name ?? "N/A", 14, 85);
    doc.text(workOrder.customerId?.email ?? "N/A", 14, 90);
    doc.text(workOrder.customerId?.phone ?? "N/A", 14, 95);
    doc.text(
      `Vehicle: ${workOrder.vehicleId?.model ?? "N/A"} (${
        workOrder.vehicleId?.registration_number ?? "N/A"
      })`,
      14,
      100
    );

    const tableData = [
      ...(workOrder.services ?? []).map((s) => [
        s.serviceName ?? "Unknown Service",
        "1",
        `${(s.price ?? 0).toLocaleString("en-IN")}`,
        `${(s.price ?? 0).toLocaleString("en-IN")}`,
      ]),
      ...(workOrder.products ?? []).map((p) => [
        p.productId?.productName ?? "Unknown Product",
        p.quantity?.toString() ?? "0",
        `${(p.productId?.price ?? 0).toLocaleString("en-IN")}`,
        `${((p.productId?.price ?? 0) * (p.quantity ?? 0)).toLocaleString(
          "en-IN"
        )}`,
      ]),
      ...(workOrder.serviceCharges ?? []).map((c) => [
        `${c.description ?? "N/A"} (${c.for ?? "N/A"})`,
        "1",
        `${(c.price ?? 0).toLocaleString("en-IN")}`,
        `${(c.price ?? 0).toLocaleString("en-IN")}`,
      ]),
    ];

    autoTable(doc, {
      startY: 120,
      head: [["Description", "Quantity", "Unit Price", "Amount"]],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [33, 150, 243],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { halign: "center", cellWidth: 30 },
        2: { halign: "left", cellWidth: 40 },
        3: { halign: "left", cellWidth: 40 },
      },
      margin: { left: 14, right: 14 },
      didDrawPage: () => {
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.text("Generated by OZON Detailing & Car Wash", 14, 280);
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal (Services Charges):", 120, finalY);
    doc.text(
      `${(workOrder.totalServiceCharge ?? 0).toLocaleString("en-IN")}`,
      190,
      finalY,
      { align: "left" }
    );

    doc.text("Subtotal (Products):", 120, finalY + 7);
    doc.text(
      `${(workOrder.totalProductCost ?? 0).toLocaleString("en-IN")}`,
      190,
      finalY + 7,
      { align: "left" }
    );

    if (workOrder.discount) {
      const discountAmount = parseFloat(workOrder.discount) || 0;
      doc.text("Discount:", 120, finalY + 14);
      doc.text(`${discountAmount.toLocaleString("en-IN")}`, 190, finalY + 14, {
        align: "left",
      });
    }

    doc.setFont("helvetica", "bold");
    doc.text("Total Amount:", 120, finalY + (workOrder.discount ? 21 : 14));
    doc.text(
      `${(workOrder.totalAmount ?? 0).toLocaleString("en-IN")}`,
      190,
      finalY + (workOrder.discount ? 21 : 14),
      { align: "left" }
    );

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Notes:", 14, finalY + 35);
    doc.text(
      workOrder.notes ||
        "Thank you for choosing OZON Detailing & Car Wash.",
      14,
      finalY + 40,
      { maxWidth: 180 }
    );

    if (preview) {
      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPreviewPdfUrl(pdfUrl);
      setCurrentWorkOrder(workOrder);
      setPreviewModalOpen(true);
    } else {
      doc.save(`Invoice_${workOrder.customerId?.name ?? "WorkOrder"}.pdf`);
    }
  };

  // Close preview modal
  const closePreviewModal = () => {
    setPreviewPdfUrl("");
    setCurrentWorkOrder(null);
    setPreviewModalOpen(false);
  };

  // Close edit modal and refresh data
  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedWorkOrder(undefined);
    fetchWorkOrders();
  };

  // Close password modal
  const closePasswordModal = () => {
    setPasswordModalOpen(false);
    setPassword("");
    setPasswordError(null);
    setPendingAction(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by customer name, phone, or serial number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 pl-10"
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={20}
            />
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={clearDateFilter}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Clear Dates
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : filteredWorkOrders.length === 0 &&
            (searchTerm || startDate || endDate) ? (
            <div className="p-4 text-center text-gray-500">
              No work orders found for the given search or date range.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sl Num
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWorkOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.serialNumber ?? "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customerId?.name ?? "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.vehicleId?.model ?? "N/A"} (
                      {order.vehicleId?.registration_number ?? "N/A"})
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{(order.totalAmount ?? 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{order.discount ?? 0}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateStatus(
                            order._id,
                            e.target.value as "pending" | "paid"
                          )
                        }
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-blue-500 ${
                          order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-IN")
                        : "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.paymentDetails?.method ?? "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => promptForEdit(order)}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          title="Edit Work Order"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => promptForDelete(order._id)}
                          className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          title="Delete Work Order"
                        >
                          <Trash size={16} />
                        </button>
                        <button
                          onClick={() => generateInvoice(order, true)}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          title="Preview Invoice"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => generateInvoice(order, false)}
                          className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          title="Download Invoice"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {previewModalOpen && (
          <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Invoice Preview</h3>
                <button
                  onClick={closePreviewModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="w-full h-[70vh]">
                <iframe
                  src={previewPdfUrl}
                  className="w-full h-full border rounded"
                  title="Invoice Preview"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={closePreviewModal}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = previewPdfUrl;
                    link.download = `Invoice_${
                      currentWorkOrder?.customerId?.name ?? "Invoice"
                    }.pdf`;
                    link.click();
                    closePreviewModal();
                  }}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        )}

        {editModalOpen && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Edit Work Order</h3>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <WorkOrderForm
                workOrder={selectedWorkOrder}
                onSave={closeEditModal}
              />
            </div>
          </div>
        )}

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
      </div>
    </div>
  );
});

export default WorkOrderTable;
