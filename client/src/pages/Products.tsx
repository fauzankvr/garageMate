import { useEffect, useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import useProduct from "../hooks/useProduct";
import UserActions from "../components/layout/headers/UserActions";
import Table from "../components/ui/Table";
import Sidebar from "../components/layout/Sidebar";
import ProductForm from "../components/ui/ProductForm";
import InputField from "../components/common/input/input";
import instance from "../axios/axios";
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

  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [initialFetchDone, setInitialFetchDone] = useState<boolean>(false);

  // Password modal states
  const [passwordModalOpen, setPasswordModalOpen] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isPasswordSubmitting, setIsPasswordSubmitting] =
    useState<boolean>(false); // Add loading state
  const [pendingAction, setPendingAction] = useState<{
    type: "edit" | "delete";
    item?: Product;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Fixed useEffect - only run once on mount
  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setIsLoading(true);
        await fetchProducts();
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setInitialFetchDone(true);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Verify password via API
  const verifyPassword = async (password: string): Promise<boolean> => {
    try {
      const res = await instance.post("/api/customer/verify-password", {
        password,
      });
      return res.data.success;
    } catch (err: any) {
      console.error("Error verifying password:", err);
      setPasswordError(
        err.response?.data?.message || "Failed to verify password"
      );
      return false;
    }
  };

  // Handle password submission with proper loading state
  const handlePasswordSubmit = async () => {
    if (!password || isPasswordSubmitting) {
      return; // Prevent multiple submissions
    }

    if (!password.trim()) {
      setPasswordError("Please enter a password");
      return;
    }

    setIsPasswordSubmitting(true);
    setPasswordError(null);

    try {
      const isValid = await verifyPassword(password);
      if (isValid) {
        setPasswordModalOpen(false);
        setPassword("");

        if (pendingAction?.type === "edit" && pendingAction.item) {
          prepareEdit(pendingAction.item);
          setIsEditModalOpen(true);
        } else if (pendingAction?.type === "delete" && pendingAction.item) {
          if (window.confirm("Are you sure you want to delete this product?")) {
            try {
              await handleDelete(pendingAction.item);
              // Refresh products after successful deletion
              await fetchProducts();
            } catch (error: any) {
              console.error("Error deleting product:", error);
              alert("Failed to delete product. Please try again.");
            }
          }
        }
      } else {
        setPasswordError("Invalid password");
      }
    } catch (error) {
      console.error("Password submission error:", error);
      setPasswordError("An error occurred. Please try again.");
    } finally {
      setIsPasswordSubmitting(false);
      setPendingAction(null);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isPasswordSubmitting) {
      handlePasswordSubmit();
    }
  };

  // Close password modal
  const closePasswordModal = () => {
    setPasswordModalOpen(false);
    setPassword("");
    setPasswordError(null);
    setIsPasswordSubmitting(false);
    setPendingAction(null);
  };

  const onEdit = (item: Product) => {
    setPendingAction({ type: "edit", item });
    setPasswordModalOpen(true);
    setPassword("");
    setPasswordError(null);
    setIsPasswordSubmitting(false);
  };

  const onDelete = (item: Product) => {
    setPendingAction({ type: "delete", item });
    setPasswordModalOpen(true);
    setPassword("");
    setPasswordError(null);
    setIsPasswordSubmitting(false);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  // Filter products based on search query
  const filteredProducts = products.filter((product) =>
    product.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const data: React.ReactNode[][] = filteredProducts.map((item: Product) => {
    const actionCell = (
      <div className="space-x-2" key={`actions-${item._id}`}>
        <button
          onClick={() => onEdit(item)}
          className="text-blue-500 hover:underline"
          title="Edit Product"
          disabled={isPasswordSubmitting}
        >
          Edit
        </button>
        <span className="text-gray-400">|</span>
        <button
          onClick={() => onDelete(item)}
          className="text-red-500 hover:underline"
          title="Delete Product"
          disabled={isPasswordSubmitting}
        >
          Delete
        </button>
      </div>
    );

    return [
      item.productName,
      item.description || "No description",
      `₹${item.price.toFixed(2)}`, // Format price nicely
      item.stock != null ? item.stock.toString() : "0",
      item.brand || "N/A",
      actionCell,
    ];
  });

  // Show loading state
  if (isLoading && !initialFetchDone) {
    return (
      <div className="flex min-h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

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
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <InputField
              name="search"
              type="text"
              value={searchQuery}
              placeholder="Enter product name..."
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64"
            />
            <div className="flex space-x-2">
              <UserActions />
              <button
                onClick={openAddModal}
                className="bg-blue-500 text-white px-4 py-1 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                disabled={isPasswordSubmitting}
              >
                Add New Product
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          {products.length === 0 && !searchQuery && initialFetchDone && (
            <div className="p-4 text-center text-gray-500">
              No products available.
            </div>
          )}
          {filteredProducts.length === 0 && searchQuery && initialFetchDone && (
            <div className="p-4 text-center text-gray-500">
              No products found for "{searchQuery}".
            </div>
          )}
          {passwordError && !passwordModalOpen && (
            <div className="p-4 text-center text-red-500 mb-4">
              {passwordError}
            </div>
          )}
          {filteredProducts.length > 0 && (
            <Table headers={headers} data={data} />
          )}
        </div>

        {/* Password Modal */}
        {passwordModalOpen && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">
                  {isPasswordSubmitting ? "Verifying..." : "Enter Password"}
                </h3>
                <button
                  onClick={closePasswordModal}
                  className="text-gray-400 hover:text-gray-600 disabled:text-gray-200"
                  disabled={isPasswordSubmitting}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mb-4 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter password"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 pr-10 disabled:bg-gray-100"
                  autoFocus
                  disabled={isPasswordSubmitting}
                />
                <button
                  type="button"
                  onClick={() =>
                    !isPasswordSubmitting && setShowPassword(!showPassword)
                  }
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:text-gray-300"
                  title={showPassword ? "Hide password" : "Show password"}
                  disabled={isPasswordSubmitting}
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
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={isPasswordSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  className={`flex-1 py-2 rounded-lg text-white flex items-center justify-center ${
                    isPasswordSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  disabled={isPasswordSubmitting || !password.trim()}
                >
                  {isPasswordSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Edit Product</h2>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
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
                    onClick={closeEditModal}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Add New Product</h2>
                <button
                  onClick={closeAddModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <ProductForm setProduct={setProduct} onSuccess={closeAddModal} />
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
