import { useEffect, useState } from "react";
import instance from "../axios/axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { X, Eye, Download } from "lucide-react";
import logoImage from "../assets/logo.png"; // Assuming logo is in assets folder

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
}

interface ServiceCharge {
  description: string;
  price: number;
  for: string;
}

interface WorkOrder {
  _id: string;
  customerId: Customer;
  vehicleId: Vehicle;
  services: Service[];
  products: Product[];
  serviceCharges: ServiceCharge[];
  totalProductCost: number;
  totalServiceCharge: number;
  totalAmount: number;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  createdAt?: string;
  updatedAt?: string;
}

const WorkOrderTable = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string>("");
  const [currentWorkOrder, setCurrentWorkOrder] = useState<WorkOrder | null>(
    null
  );

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        const res = await instance.get("/api/work-order");
        setWorkOrders(res.data.data);
      
      } catch (err) {
        console.error("Error fetching work orders", err);
      }
    };
    fetchWorkOrders();
  }, []);

  const generateInvoice = (workOrder: WorkOrder, preview: boolean = false) => {
    const doc = new jsPDF({ format: "a4" });

    // -------- Logo --------
    try {
      doc.addImage(logoImage, "PNG", 14, 10, 50, 30); // Logo at top-left, 50x30mm
    } catch (error) {
      console.error("Error loading logo:", error);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("OZON Detailing & Car Wash", 14, 20); // Fallback text
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
    const invoiceNumber = `INV-${Math.random()
      .toString(36)
      .substr(2, 6)
      .toUpperCase()}`;
    doc.text(`Invoice Number: ${invoiceNumber}`, 180, 30, { align: "right" });
    doc.text(
      `Date of Issue: ${new Date().toLocaleDateString("en-IN")}`,
      180,
      35,
      { align: "right" }
    );
    doc.text(`Due Date: ${new Date().toLocaleDateString("en-IN")}`, 180, 40, {
      align: "right",
    });

    // -------- Client Info --------
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 14, 80);
    doc.setFont("helvetica", "normal");
    doc.text(workOrder.customerId?.name || "N/A", 14, 85);
    doc.text(workOrder.customerId?.email || "N/A", 14, 90);
    doc.text(workOrder.customerId?.phone || "N/A", 14, 95);
    doc.text(
      `Vehicle: ${workOrder.vehicleId?.model || "N/A"} (${
        workOrder.vehicleId?.registration_number || "N/A"
      })`,
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
        "1",
        `${(p.price || 0).toLocaleString("en-IN")}`,
        `${(p.price || 0).toLocaleString("en-IN")}`,
      ]),
      ...workOrder.serviceCharges.map((c) => [
        `${c.description} (${c.for})`,
        "1",
        `${(c.price || 0)}`,
        `${(c.price || 0).toLocaleString("en-IN")}`,
      ]),
    ];

    // Recalculate totals to ensure accuracy
    // const calculatedServiceTotal =
    //   workOrder.services.reduce((sum, s) => sum + (s.price || 0), 0) +
    //   workOrder.serviceCharges.reduce((sum, c) => sum + (c.price || 0), 0);
    // const calculatedProductTotal = workOrder.products.reduce(
    //   (sum, p) => sum + (p.price || 0),
    //   0
    // );
    // const calculatedGrandTotal =
    //   calculatedServiceTotal + calculatedProductTotal;

    autoTable(doc, {
      startY: 110,
      head: [["Description", "Quantity", "Unit Price", "Amount"]],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [33, 150, 243], // Blue header
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 80 }, // Description
        1: { halign: "center", cellWidth: 30 }, // Quantity
        2: { halign: "left", cellWidth: 40 }, // Unit Price
        3: { halign: "left", cellWidth: 40 }, // Amount
      },
      margin: { left: 14, right: 14 },
      didDrawPage: () => {
        // Add footer
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
    doc.text(`${workOrder.totalServiceCharge}`, 190, finalY, {
      align: "left",
    });

    doc.text("Subtotal (Products):", 120, finalY + 7);
    doc.text(
      `${workOrder.totalProductCost}`,
      190,
      finalY + 7,
      { align: "left" }
    );

    doc.setFont("helvetica", "bold");
    doc.text("Total Amount:", 120, finalY + 14);
    doc.text(
      `${workOrder.totalAmount.toLocaleString("en-IN")}`,
      190,
      finalY + 14,
      { align: "left" }
    );

    // doc.setFont("helvetica", "bold");
    // doc.text("Amount Due:", 140, finalY + 21);
    // doc.text(
    //   `₹${calculatedGrandTotal.toLocaleString("en-IN")}`,
    //   190,
    //   finalY + 21,
    //   { align: "right" }
    // );

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
    setPreviewModalOpen(false);
    setPreviewPdfUrl("");
    setCurrentWorkOrder(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Work Orders</h2>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
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
            {workOrders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.customerId?.name || "N/A"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.vehicleId?.model || "N/A"} (
                  {order.vehicleId?.registration_number || "N/A"})
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  <div
                    className="max-w-xs truncate"
                    title={
                      order.services?.map((s) => s.serviceName).join(", ") ||
                      "N/A"
                    }
                  >
                    {order.services?.map((s) => s.serviceName).join(", ") ||
                      "N/A"}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  <div
                    className="max-w-xs truncate"
                    title={
                      order.products?.map((p) => p.productName).join(", ") ||
                      "N/A"
                    }
                  >
                    {order.products?.map((p) => p.productName).join(", ") ||
                      "N/A"}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  <div
                    className="max-w-xs truncate"
                    title={
                      order.serviceCharges
                        ?.map((c) => `${c.description} (₹${c.price})`)
                        .join(", ") || "N/A"
                    }
                  >
                    {order.serviceCharges
                      ?.map((c) => c.description)
                      .join(", ") || "N/A"}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{order.totalAmount?.toLocaleString("en-IN") || "0"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.status === "in-progress"
                        ? "bg-blue-100 text-blue-800"
                        : order.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => generateInvoice(order, true)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      title="Preview Invoice"
                    >
                      <Eye size={16} />
                      Preview
                    </button>
                    <button
                      onClick={() => generateInvoice(order, false)}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      title="Download Invoice"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
                  link.download = `Invoice_${
                    currentWorkOrder?.customerId?.name || "Invoice"
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
    </div>
  );
};

export default WorkOrderTable;
