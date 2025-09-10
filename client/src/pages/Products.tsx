import { useEffect, useState } from "react";
import useProduct from "../hooks/useProduct";
import UserActions from "../components/layout/headers/UserActions";
import Table from "../components/ui/Table";
import Sidebar from "../components/layout/Sidebar";
import ProductForm from "../components/ui/ProductForm";
import InputField from "../components/common/input/input";
import type { Product } from "../types/Products";


// Define the Field interface
interface Field {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "number";
  placeholder: string;
  value: string;
  options?: { label: string; value: string }[];
}

// Define the return type of useProduct hook
interface UseProductReturn {
  products: Product[];
  headers: string[];
  fetchProducts: () => Promise<void>;
  prepareEdit: (product: Product) => void;
  handleDelete: (product: Product) => Promise<void>;
  editFields: Field[];
  handleEditInputChange: (
    index: number,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleEditSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  setProduct: React.Dispatch<React.SetStateAction<Product[]>>;
}

const Products = () => {
  const {
    products,
    headers,
    fetchProducts,
    prepareEdit,
    handleDelete,
    editFields,
    handleEditInputChange,
    handleEditSubmit,
    setProduct,
  } = useProduct() as UseProductReturn;

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const onEdit = (item: Product) => {
    prepareEdit(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const data = products.map(
    (item: Product) =>
      [
        item.productName,
        item.description,
        item.price.toString(), // Convert to string for display
        item.sku,
        item.category,
        item.brand,
        <div className="space-x-2" key={`${item.sku}-actions`}>
          <button
            onClick={() => onEdit(item)}
            className="text-blue-500 hover:underline"
          >
            Edit
          </button>
          <span className="text-gray-400">|</span>
          <button
            onClick={() => handleDelete(item)}
            className="text-red-500 hover:underline"
          >
            Delete
          </button>
        </div>,
      ] as (string | number )[]
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="hidden md:block w-50 bg-white border-r shadow">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col w-full md:w-auto p-4 sm:p-6 lg:p-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            Products
          </h1>
          <UserActions />
        </div>
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <Table headers={headers} data={data} />
        </div>
        {isModalOpen && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Edit Product</h2>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                {editFields.map((field, index) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      {field.label}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        name={field.name}
                        value={field.value}
                        placeholder={field.placeholder}
                        onChange={(e) => handleEditInputChange(index, e)}
                        className="w-full p-2 bg-gray-50 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                      />
                    ) : (
                      <InputField
                        label={field.label}
                        name={field.name}
                        type={field.type}
                        value={field.value}
                        placeholder={field.placeholder}
                        onChange={(e) => handleEditInputChange(index, e)}
                        className="w-full"
                      />
                    )}
                  </div>
                ))}
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <div className="w-full p-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
            Add New Product
          </h2>
          <ProductForm setProduct={setProduct} />
        </div>
      </div>
    </div>
  );
};

export default Products;
