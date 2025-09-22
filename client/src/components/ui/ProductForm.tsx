import { useState } from "react";
import instance from "../../axios/axios";
import type { Product } from "../../types/Products";

// Define the Field interface
interface Field {
  name: string;
  label: string;
  type: "text" | "textarea" | "number";
  placeholder: string;
  value: string;
}

// Define the Props interface for ProductForm
interface ProductFormProps {
  setProduct: React.Dispatch<React.SetStateAction<Product[]>>;
  onSuccess?: () => void; // Added to handle modal close
}

const ProductForm = ({ setProduct, onSuccess }: ProductFormProps) => {
  const [fields, setFields] = useState<Field[]>([
    {
      name: "productName",
      label: "Product Name",
      type: "text",
      placeholder: "Enter product name",
      value: "",
    },
    {
      name: "price",
      label: "Product Price",
      type: "number",
      placeholder: "Enter product price",
      value: "",
    },
    {
      name: "description",
      label: "Product Description",
      type: "textarea",
      placeholder: "Enter product description",
      value: "",
    },
    {
      name: "brand",
      label: "Product Brand",
      type: "text",
      placeholder: "Enter product brand",
      value: "",
    },
    {
      name: "stock",
      label: "Stock Quantity",
      type: "number",
      placeholder: "Enter stock quantity",
      value: "",
    },
  ]);

  const handleInputChange = (
    index: number,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const value = e.target.value;
    setFields((prev) => {
      const updated = [...prev];
      updated[index].value = value;
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = fields.reduce((acc, field) => {
      acc[field.name] =
        field.type === "number" ? Number(field.value) : field.value;
      return acc;
    }, {} as Record<string, string | number>);

    try {
      const res = await instance.post("/api/product", data);
      setProduct((prev: Product[]) => [...prev, res.data]);
      console.log("✅ Product created:", res.data);
      if (onSuccess) onSuccess(); // Call onSuccess to close modal
      // Reset form
      setFields(fields.map((field) => ({ ...field, value: "" })));
    } catch (err) {
      console.error("❌ Error creating product:", err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 mx-auto bg-white rounded-2xl"
    >
      {fields.map((field, index) => (
        <div
          key={field.name}
          className={field.type === "textarea" ? "md:col-span-2" : ""}
        >
          <label className="block mb-1 text-sm font-medium text-gray-700">
            {field.label}
          </label>
          {field.type === "textarea" ? (
            <textarea
              value={field.value}
              onChange={(e) => handleInputChange(index, e)}
              placeholder={field.placeholder}
              className="w-full border border-gray-300 rounded-md px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <input
              type={field.type}
              value={field.value}
              onChange={(e) => handleInputChange(index, e)}
              placeholder={field.placeholder}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>
      ))}
      <div className="md:col-span-2">
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
