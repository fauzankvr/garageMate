import { useState } from "react";
import useBill from "../hooks/useBill";
import BillInput from "../components/common/input/BillInput";
import Sidebar from "../components/layout/Sidebar";
import BillTable from "../components/ui/BillTable";
import SearchBar from "../components/common/search/SearchBar";
import jsPDF from "jspdf";

// Define the Field interface
interface Field {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "number";
  placeholder: string;
  value: string;
  options?: { label: string; value: string }[];
}

// Define the BillData interface
interface BillData {
  [key: string]: string | number; // Dynamic keys for form fields
  paymentMethod: string;
}

// Define the return type of useBill hook
interface UseBillReturn {
  fields: Field[];
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleInputChange: (
    index: number,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
}

const Billing = () => {
  const { fields, handleSubmit, handleInputChange } =
    useBill() as UseBillReturn;
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI">("CASH");
  const [billData, setBillData] = useState<BillData | null>(null);

  const handlePaymentMethod = (method: "CASH" | "UPI") => {
    setPaymentMethod(method);
  };

  const onPrintBill = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = fields.reduce((acc, field) => {
      acc[field.name] = field.name.includes("Amount")
        ? Number(field.value) || 0
        : field.value;
      return acc;
    }, {} as BillData);
    formData.paymentMethod = paymentMethod;
    setBillData(formData);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setBillData(null);
  };

  const confirmAndSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await handleSubmit(new Event("submit") as unknown as React.FormEvent<HTMLFormElement>); // Submit to backend
      closeModal();
    } catch (error) {
      console.error("Error submitting bill:", error);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Header
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Garagemate", 20, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Auto Detailing Services", 20, 25);
    doc.text("123 Detailing Lane, Mumbai, India", 20, 30);
    doc.text("Phone: +91-123-456-7890 | Email: info@garagemate.com", 20, 35);
    doc.line(20, 40, 190, 40); // Horizontal line

    // Invoice Details
    doc.setFontSize(12);
    doc.text("INVOICE", 150, 25);
    doc.text(`Invoice No: 001`, 150, 30);
    doc.text(
      `Date: ${new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}`,
      150,
      35
    );

    // Customer Information (Vehicle & Customer Details)
    doc.setFontSize(14);
    doc.text("Bill To:", 20, 50);
    doc.setFontSize(12);
    let y = 55;
    fields.slice(0, 4).forEach((field) => {
      doc.text(`${field.label}: ${field.value || "N/A"}`, 20, y);
      y += 5;
    });

    // Table Header for Services
    y += 10;
    doc.setFillColor(200, 220, 240);
    doc.rect(20, y, 170, 7, "F"); // Filled background
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Description", 25, y + 5);
    doc.text("Quantity", 90, y + 5);
    doc.text("Rate", 130, y + 5);
    doc.text("Amount", 160, y + 5);
    doc.line(20, y + 7, 190, y + 7); // Separator line

    // Service Details
    y += 10;
    const serviceFields = fields.slice(4, 8);
    serviceFields.forEach((field, index) => {
      doc.text(field.label, 25, y);
      doc.text("1", 90, y); // Assuming quantity as 1
      const rate = fields.slice(8)[index]?.value || "0.00";
      doc.text(rate.toString(), 130, y);
      doc.text(rate.toString(), 160, y); // Amount same as rate for simplicity
      y += 7;
    });

    // Total Section
    y += 10;
    doc.line(20, y, 190, y); // Horizontal line
    const totalAmount =
      fields.find((f) => f.name === "totalAmount")?.value || "0.00";
    doc.text("Total Amount:", 130, y + 5);
    doc.text(`₹${totalAmount}`, 160, y + 5, { align: "right" });
    doc.line(20, y + 7, 190, y + 7); // Horizontal line

    // Payment Method
    y += 10;
    doc.text(`Payment Method: ${paymentMethod}`, 20, y);

    // Thank You Note
    y += 10;
    doc.setFontSize(10);
    doc.text(
      "Thank you for your business! Visit us at www.garagemate.com",
      20,
      y,
      { align: "center" }
    );

    // Save or Open PDF
    const pdfDataUri = doc.output("datauristring");
    const customerName = billData?.customerName?.toString() || "bill";
    if (window.location.href.includes("print")) {
      doc.save(`invoice_${customerName}.pdf`);
    } else {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <body onload="window.print();window.close()">
              <iframe src="${pdfDataUri}" style="width: 100%; height: 100%; border: none;"></iframe>
            </body>
          </html>
        `);
      }
    }
  };

  const printBill = () => {
    generatePDF(); // Reuse generatePDF for print
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-10">
        {/* Header */}
        <div className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold">Billing</h1>
          <p className="text-gray-600 text-lg">
            Create and manage bills for your detailing services.
          </p>
        </div>

        {/* Create New Bill Section */}
        <div className="bg-white rounded-xl p-8 max-w-5xl">
          <h2 className="text-2xl font-semibold mb-6">Create New Bill</h2>

          <form onSubmit={onPrintBill} className="space-y-10">
            {/* Section: Vehicle & Customer details */}
            <div>
              <h3 className="text-xl font-semibold mb-4">
                Vehicle & Customer details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fields.slice(0, 4).map((field, index) => (
                  <BillInput
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    type={field.type}
                    value={field.value}
                    options={field.options}
                    placeholder={field.placeholder}
                    onChange={(e) => handleInputChange(index, e)}
                    className="w-full"
                  />
                ))}
              </div>
            </div>

            {/* Section: Service details */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Service details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fields.slice(4, 6).map((field, index) => (
                  <BillInput
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    type={field.type}
                    value={field.value}
                    placeholder={field.placeholder}
                    options={field.options}
                    onChange={(e) => handleInputChange(index + 4, e)}
                    className="w-full"
                  />
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {fields.slice(6, 8).map((field, index) => (
                  <BillInput
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    type={field.type}
                    value={field.value}
                    placeholder={field.placeholder}
                    onChange={(e) => handleInputChange(index + 6, e)}
                    className="w-full"
                  />
                ))}
              </div>
            </div>

            {/* Section: Price details */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Price details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fields.slice(8).map((field, index) => (
                  <BillInput
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    type={field.type}
                    value={field.value}
                    placeholder={field.placeholder}
                    onChange={(e) => handleInputChange(index + 8, e)}
                    className="w-full"
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 py-4">
              {/* Payment Method Section */}
              <div>
                <h3 className="text-xl font-semibold mb-2">Payment Method</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handlePaymentMethod("CASH")}
                    className={`px-4 py-2 border rounded-md transition ${
                      paymentMethod === "CASH"
                        ? "bg-gray-200"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    CASH
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePaymentMethod("UPI")}
                    className={`px-4 py-2 border rounded-md transition ${
                      paymentMethod === "UPI"
                        ? "bg-gray-200"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    UPI
                  </button>
                </div>
              </div>

              {/* Print Bill Button */}
              <div>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gray-300 text-black font-medium rounded-md hover:bg-gray-400 transition mt-8"
                >
                  Print Bill
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Modal for Bill Preview */}
        {isModalOpen && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">Bill Preview</h2>
              <div className="space-y-6">
                {/* Vehicle & Customer Details */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    Vehicle & Customer Details
                  </h3>
                  {fields.slice(0, 4).map((field) => (
                    <div key={field.name} className="mb-2">
                      <span className="font-medium">{field.label}:</span>{" "}
                      {field.value || "N/A"}
                    </div>
                  ))}
                </div>

                {/* Service Details */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    Service Details
                  </h3>
                  {fields.slice(4, 8).map((field) => (
                    <div key={field.name} className="mb-2">
                      <span className="font-medium">{field.label}:</span>{" "}
                      {field.value || "N/A"}
                    </div>
                  ))}
                </div>

                {/* Price Details */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Price Details</h3>
                  {fields.slice(8).map((field) => (
                    <div key={field.name} className="mb-2">
                      <span className="font-medium">{field.label}:</span>{" "}
                      {field.value || "N/A"}
                    </div>
                  ))}
                </div>

                {/* Payment Method */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Payment Method</h3>
                  <div className="mb-2">
                    <span className="font-medium">Method:</span> {paymentMethod}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={generatePDF}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={printBill}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  Print
                </button>
                <button
                  type="button"
                  onClick={confirmAndSubmit}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                >
                  Confirm and Save
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl p-6 shadow-sm mt-8">
          <h3 className="text-lg font-semibold mb-4">Past Bills</h3>
          <SearchBar />
          <BillTable />
        </div>
      </div>
    </div>
  );
};

export default Billing;
