import { useEffect, useState } from "react";
import instance from "../axios/axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const WorkOrderTable = () => {
  const [workOrders, setWorkOrders] = useState<any[]>([]);

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

 const generateInvoice = (workOrder: any) => {
  const doc = new jsPDF();

  // -------- Header --------
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 14, 20);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice Number: INV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, 14, 30);
  doc.text(`Date of Issue: ${new Date().toLocaleDateString("en-IN")}`, 14, 37);
  doc.text(`Due Date: ${new Date().toLocaleDateString("en-IN")}`, 14, 44);

  // -------- Company & Client Info --------
  doc.setFont("helvetica", "bold");
  doc.text("Your Company Name", 14, 60);
  doc.setFont("helvetica", "normal");
  doc.text("123 Business Street", 14, 67);
  doc.text("Kerala, India", 14, 74);
  doc.text("info@yourcompany.com", 14, 81);

  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 140, 60);
  doc.setFont("helvetica", "normal");
  doc.text(workOrder.costumerId.name, 140, 67);
  doc.text(workOrder.costumerId.email, 140, 74);
  doc.text(workOrder.costumerId.phone, 140, 81);

  // -------- Table (Products + Services) --------
  const tableData = [
    ...workOrder.productId.map((p: any) => [
      p.productName,
      "1",
      `${p.price.toLocaleString("en-IN")}`,
      `${p.price.toLocaleString("en-IN")}`
    ]),
    [
      workOrder.serviceId.serviceName,
      "1",
      `${workOrder.serviceId.price.toLocaleString("en-IN")}`,
      `${workOrder.serviceId.price.toLocaleString("en-IN")}`
    ]
  ];

  autoTable(doc, {
    startY: 100,
    head: [["Description", "Qty", "Unit Price", "Amount"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [240, 240, 240], textColor: 20, halign: "center" },
    bodyStyles: { valign: "middle", fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 80 }, // Description
      1: { halign: "center", cellWidth: 20 }, // Qty
      2: { halign: "right", cellWidth: 40 }, // Unit Price
      3: { halign: "right", cellWidth: 40 } // Amount
    }
  });

  // -------- Totals --------
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const total = workOrder.totalAmount.toLocaleString("en-IN");

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Subtotal:", 150, finalY);
  doc.text(`${total}`, 190, finalY, { align: "right" });

  doc.text("Total:", 150, finalY + 7);
  doc.text(`${total}`, 190, finalY + 7, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.text("Amount Due:", 150, finalY + 20);
  doc.text(`${total}`, 190, finalY + 20, { align: "right" });

  // Save/Preview
  doc.save(workOrder.costumerId.name);
};

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Work Orders</h2>
      <table className="min-w-full bg-white border rounded-lg shadow">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2 border">Customer</th>
            <th className="p-2 border">Vehicle</th>
            <th className="p-2 border">Service</th>
            <th className="p-2 border">Total Amount</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        
        <tbody>
          {workOrders.map((order) => (
            <tr key={order._id} className="hover:bg-gray-100">
              <td className="p-2 border">{order.costumerId?.name}</td>
              <td className="p-2 border">{order.vehicleId?.model}</td>
              <td className="p-2 border">{order.serviceId?.serviceName}</td>
              <td className="p-2 border">{order.totalAmount}</td>
              <td className="p-2 border">
                <button
                  onClick={() => generateInvoice(order)}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Download Invoice
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WorkOrderTable;
