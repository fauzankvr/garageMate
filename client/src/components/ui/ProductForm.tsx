import {  useState } from "react";
import instance from "../../axios/axios";

interface Field {
  name: string;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder: string;
  value: string;
  options?: { label: string; value: string }[];
}

const ProductForm = ({setProduct}) => {
  const [fields, setFields] = useState<Field[]>([
    {
      name: "productName", // ✅ match API
      label: "Product Name",
      type: "text",
      placeholder: "Enter product name",
      value: "",
    },
    {
      name: "price", // ✅ match API
      label: "Product Price",
      type: "text",
      placeholder: "Enter product price",
      value: "",
    },
    {
      name: "description", // ✅ match API
      label: "Product Description",
      type: "textarea",
      placeholder: "Enter product description",
      value: "",
    },
    {
      name: "brand", // ✅ match API
      label: "Product Brand",
      type: "text",
      placeholder: "Enter product brand",
      value: "",
    },
  ]);

  const handleInputChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
      acc[field.name] = field.value;
      return acc;
    }, {} as Record<string, string>);

    // Convert price to number
    if (data.price) {
      data.price = Number(data.price) as any;
    }

    console.log("Payload to API:", data);

    try {
      const res = await instance.post("/api/product", data);
     setProduct((prev) => [...prev, res.data]);
      console.log("✅ Product created:", res.data);
    } catch (err) {
      console.error("❌ Error creating product:", err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 mx-auto bg-white rounded-2xl mt-5"
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
              type="text"
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