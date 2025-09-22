import { useEffect, useState, useCallback } from "react";
import { debounce } from "lodash"; // Add lodash for debouncing
import instance from "../axios/axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Search, X, Eye, Download, Edit, Trash } from "lucide-react";
import logoImage from "../assets/logo.png"; // Assuming logo is in assets folder
import WorkOrderForm from "../components/ui/CreateWorkOrder";

// Type definitions to match updated backend schema
interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface Vehicle {
  _id: string;
  model: string;
  registration_number: string;
}

interface Service {
  _id: string;
  serviceName: string;
  price: number;
  description: string;
}

interface Product {
  _id: string;
  productName: string;
  price: number;
  quantity?: number;
}

interface ServiceCharge {
  description: string;
  price: number;
  for: string;
}

interface PaymentDetails {
  method: "cash" | "upi" | "both";
  cashAmount?: number;
  upiAmount?: number;
}

interface WorkOrder {
  _id: string;
  customerId: Customer;
  vehicleId?: Vehicle; // Optional
  services: Service[];
  products: Product[];
  serviceCharges: ServiceCharge[];
  totalProductCost: number;
  totalServiceCharge: number;
  totalAmount: number;
  status: "pending" | "paid";
  paymentDetails: PaymentDetails;
  createdAt?: string;
  updatedAt?: string;
}

interface WorkOrderData {
  _id?: string;
  customerId: string;
  vehicleId?: string;
  services: string[];
  products: string[];
  serviceCharges: ServiceCharge[];
  totalServiceCharge: number;
  totalProductCost: number;
  totalAmount: number;
  status: "pending" | "paid";
  paymentDetails: PaymentDetails;
}

const WorkOrderTable = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [filteredWorkOrders, setFilteredWorkOrders] = useState<WorkOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string>("");
  const [currentWorkOrder, setCurrentWorkOrder] = useState<WorkOrder | null>(null);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrderData | undefined>(undefined);

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        const res = await instance.get("/api/work-order");
        console.log("Fetched work orders:", res.data.data); // Log response for debugging
        setWorkOrders(res.data.data || []);
        setFilteredWorkOrders(res.data.data || []);
      } catch (err) {
        console.error("Error fetching work orders:", err);
        alert("Failed to fetch work orders. Please try again.");
      }
    };
    fetchWorkOrders();
  }, []);

  // Normalize phone number for search
  const normalizePhone = (phone: string) => {
    return phone.replace(/[\s-+]/g, ""); // Remove spaces, dashes, and plus signs
  };

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setFilteredWorkOrders(
        workOrders.filter((order) => {
          // Safely access customerId properties
          const name = order.customerId?.name ? order.customerId.name.toLowerCase() : "";
          const phone = order.customerId?.phone ? normalizePhone(order.customerId.phone) : "";
          const search = term.toLowerCase();
          const normalizedSearch = normalizePhone(term);
          return name.includes(search) || phone.includes(normalizedSearch);
        })
      );
    }, 300),
    [workOrders]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  // Update status
  const updateStatus = async (id: string, newStatus: "pending" | "paid") => {
    try {
      await instance.put(`/api/work-order/${id}`, { status: newStatus });
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
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Error updating status");
    }
  };

  // Delete work order
  const deleteWorkOrder = async (id: string) => {
    if (!confirm("Are you sure you want to delete this work order?")) return;
    try {
      await instance.delete(`/api/work-order/${id}`);
      setWorkOrders((prev) => prev.filter((order) => order._id !== id));
      setFilteredWorkOrders((prev) => prev.filter((order) => order._id !== id));
      alert("Work Order deleted successfully!");
    } catch (err) {
      console.error("Error deleting work order:", err);
      alert("Error deleting work order");
    }
  };

  // Edit work order
  const editWorkOrder = (order: WorkOrder) => {
    setSelectedWorkOrder({
      _id: order._id,
      customerId: order.customerId._id,
      vehicleId: order.vehicleId?._id,
      services: order.services.map((s) => s._id),
      products: order.products.map((p) => p._id),
      serviceCharges: order.serviceCharges,
      totalServiceCharge: order.totalServiceCharge,
      totalProductCost: order.totalProductCost,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentDetails: order.paymentDetails || { method: "cash" },
    });
    setEditModalOpen(true);
  };

  const generateInvoice = (workOrder: WorkOrder, preview: boolean = false) => {
    const doc = new jsPDF({ format: "a4" });

    // -------- Logo --------
    try {
      doc.addImage(logoImage, "PNG", 14, 10, 50, 30);
    } catch (error) {
      console.error("Error loading logo:", error);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("OZON Detailing & Car Wash", 14, 20);
    }

    // -------- Company Details --------
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("OZON Detailing & Car Wash", 14, 45);
    doc.text("Kolathakkara, Manipuram", 14, 50);
    doc.text("Puthoor (PO), Omassery 673582", 14, 55);
    doc.text("+91-9447405746", 14, 60);
    doc.text("info@ozondetailing.com", 14, 65);

    // -------- Header --------
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 180, 20, { align: "right" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const invoiceNumber = `INV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    doc.text(`Invoice Number: ${invoiceNumber}`, 180, 30, { align: "right" });
    doc.text(`Date of Issue: ${new Date().toLocaleDateString("en-IN")}`, 180, 35, { align: "right" });
    doc.text(`Due Date: ${new Date().toLocaleDateString("en-IN")}`, 180, 40, { align: "right" });

    // -------- Client Info --------
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 14, 80);
    doc.setFont("helvetica", "normal");
    doc.text(workOrder.customerId?.name || "N/A", 14, 85);
    doc.text(workOrder.customerId?.email || "N/A", 14, 90);
    doc.text(workOrder.customerId?.phone || "N/A", 14, 95);
    doc.text(
      `Vehicle: ${workOrder.vehicleId?.model || "N/A"} (${workOrder.vehicleId?.registration_number || "N/A"})`,
      14,
      100
    );

    // -------- Table (Services + Products + Service Charges) --------
    const tableData = [
      ...workOrder.services.map((s) => [
        s.serviceName || "Unknown Service",
        "1",
        `${(s.price || 0).toLocaleString("en-IN")}`,
        `${(s.price || 0).toLocaleString("en-IN")}`,
      ]),
      ...workOrder.products.map((p) => [
        p.productName || "Unknown Product",
        p.quantity?.toString() || "1",
        `${(p.price || 0).toLocaleString("en-IN")}`,
        `${((p.price || 0) * (p.quantity || 1)).toLocaleString("en-IN")}`,
      ]),
      ...workOrder.serviceCharges.map((c) => [
        `${c.description} (${c.for})`,
        "1",
        `${(c.price || 0).toLocaleString("en-IN")}`,
        `${(c.price || 0).toLocaleString("en-IN")}`,
      ]),
    ];

    autoTable(doc, {
      startY: 110,
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

    // -------- Totals --------
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal (Services Charges):", 120, finalY);
    doc.text(`${workOrder.totalServiceCharge.toLocaleString("en-IN")}`, 190, finalY, { align: "left" });

    doc.text("Subtotal (Products):", 120, finalY + 7);
    doc.text(`${workOrder.totalProductCost.toLocaleString("en-IN")}`, 190, finalY + 7, { align: "left" });

    doc.setFont("helvetica", "bold");
    doc.text("Total Amount:", 120, finalY + 14);
    doc.text(`${workOrder.totalAmount.toLocaleString("en-IN")}`, 190, finalY + 14, { align: "left" });

    // -------- Notes --------
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Notes:", 14, finalY + 35);
    doc.text(
      "Thank you for choosing OZON Detailing & Car Wash. Please settle the invoice within 7 days.",
      14,
      finalY + 40
    );

    if (preview) {
      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPreviewPdfUrl(pdfUrl);
      setCurrentWorkOrder(workOrder);
      setPreviewModalOpen(true);
    } else {
      doc.save(`Invoice_${workOrder.customerId?.name || "WorkOrder"}.pdf`);
    }
  };

  const closePreviewModal = () => {
    setPreviewPdfUrl("");
    setCurrentWorkOrder(null);
    setPreviewModalOpen(false);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedWorkOrder(undefined);
  };

  const refreshWorkOrders = async () => {
    try {
      const res = await instance.get("/api/work-order");
      console.log("Refreshed work orders:", res.data.data); // Log for debugging
      setWorkOrders(res.data.data || []);
      setFilteredWorkOrders(res.data.data || []);
    } catch (err) {
      console.error("Error fetching work orders:", err);
      alert("Failed to fetch work orders. Please try again.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Work Orders</h2>
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by customer name or phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 pl-10"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {filteredWorkOrders.length === 0 && searchTerm ? (
          <div className="p-4 text-center text-gray-500">
            No work orders found for "{searchTerm}".
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Services
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Charges
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
                    {order.customerId?.name || "N/A"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.vehicleId?.model || "N/A"} ({order.vehicleId?.registration_number || "N/A"})
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    <div
                      className="max-w-xs truncate"
                      title={order.services?.map((s) => s.serviceName).join(", ") || "N/A"}
                    >
                      {order.services?.map((s) => s.serviceName).join(", ") || "N/A"}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    <div
                      className="max-w-xs truncate"
                      title={order.products?.map((p) => p.productName).join(", ") || "N/A"}
                    >
                      {order.products?.map((p) => p.productName).join(", ") || "N/A"}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    <div
                      className="max-w-xs truncate"
                      title={
                        order.serviceCharges?.map((c) => `${c.description} (₹${c.price})`).join(", ") || "N/A"
                      }
                    >
                      {order.serviceCharges?.map((c) => c.description).join(", ") || "N/A"}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{order.totalAmount?.toLocaleString("en-IN") || "0"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order._id, e.target.value as "pending" | "paid")}
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
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => editWorkOrder(order)}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        title="Edit Work Order"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteWorkOrder(order._id)}
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

      {/* Preview Modal */}
      {previewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                  link.download = `Invoice_${currentWorkOrder?.customerId?.name || "Invoice"}.pdf`;
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

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
            <WorkOrderForm workOrder={selectedWorkOrder} onSave={refreshWorkOrders} />
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrderTable;
