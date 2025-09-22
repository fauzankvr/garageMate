import { useState } from "react";
import { toast } from "react-toastify";
import type { Product } from "../types/Products";
import instance from "../axios/axios";
import { extractData } from "../utils/helper";

const useProduct = () => {
  const headers = [
    "Product Name",
    "Description",
    "Price",
    // "Sku",
    "Stock",
    "Brand",
    "Actions",
  ];

  const [products, setProduct] = useState<Product[]>([]);

  const fetchProducts = async () => {
    try {
      const response = await instance.get("/api/product");
      setProduct(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch products");
      console.error("Error fetching products:", error);
    }
  };

  const fetchProductById = async (id: string) => {
    try {
      const response = await instance.get(`/api/product/${id}`);
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch product");
      console.error("Error fetching product:", error);
      return null;
    }
  };

  const initialFields = [
    {
      name: "productName",
      label: "Product Name",
      type: "text",
      placeholder: "Enter Product name",
      value: "",
    },
    {
      name: "description",
      label: "Description",
      type: "text",
      placeholder: "Enter Product description",
      value: "",
    },
    {
      name: "price",
      label: "Price",
      type: "number",
      placeholder: "Enter Product price",
      value: "",
    },
    {
      name: "sku",
      label: "SKU",
      type: "text",
      placeholder: "Enter Product SKU",
      value: "",
    },
    {
      name: "category",
      label: "Category",
      type: "text",
      placeholder: "Enter Product category",
      value: "",
    },
    {
      name: "brand",
      label: "Brand",
      type: "text",
      placeholder: "Enter Product brand",
      value: "",
    },
  ];

  const [editFields, setEditFields] = useState(initialFields);
  const [editingId, setEditingId] = useState<string | null>(null);

  const prepareEdit = async (item: Product) => {
    const product = await fetchProductById(item._id);
    if (product) {
      setEditFields([
        {
          name: "productName",
          label: "Product Name",
          type: "text",
          placeholder: "Enter Product name",
          value: product.productName || "",
        },
        {
          name: "description",
          label: "Description",
          type: "text",
          placeholder: "Enter Product description",
          value: product.description || "",
        },
        {
          name: "price",
          label: "Price",
          type: "number",
          placeholder: "Enter Product price",
          value: product.price.toString() || "",
        },
        // {
        //   name: "sku",
        //   label: "SKU",
        //   type: "text",
        //   placeholder: "Enter Product SKU",
        //   value: product.sku || "",
        // },
        // {
        //   name: "category",
        //   label: "Category",
        //   type: "text",
        //   placeholder: "Enter Product category",
        //   value: product.category || "",
        // },
        {
          name: "brand",
          label: "Brand",
          type: "text",
          placeholder: "Enter Product brand",
          value: product.brand || "",
        },
      ]);
      setEditingId(item._id);
    }
  };

  const handleEditInputChange = (index: number, event: any) => {
    const newFields = [...editFields];
    newFields[index].value = event.target.value;
    setEditFields(newFields);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawPayload = extractData(editFields);
    const payload = {
      productName: rawPayload.productName,
      description: rawPayload.description,
      price: Number(rawPayload.price),
      sku: rawPayload.sku,
      category: rawPayload.category,
      brand: rawPayload.brand,
    };

    try {
      const res = await instance.patch(`/api/product/${editingId}`, payload);
      toast.success("Product updated successfully!");
      setProduct((prev) =>
        prev.map((p) => (p._id === editingId ? res.data : p))
      );
      setEditingId(null);
      setEditFields(initialFields); // Reset edit fields
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update product");
      console.error("Error updating product:", error);
    }
  };

  const handleDelete = async (item: Product) => {
    if (
      window.confirm(`Are you sure you want to delete ${item.productName}?`)
    ) {
      try {
        await instance.delete(`/api/product/${item._id}`);
        setProduct((prev) =>
          prev.filter((product) => product._id !== item._id)
        );
        toast.success("Product deleted successfully!");
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Failed to delete product"
        );
        console.error("Error deleting product:", error);
      }
    }
  };

  return {
    headers,
    products,
    setProduct,
    fetchProducts,
    fetchProductById,
    prepareEdit,
    handleDelete,
    editFields,
    handleEditInputChange,
    handleEditSubmit,
  };
};

export default useProduct;
