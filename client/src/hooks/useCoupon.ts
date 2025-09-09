import { useState } from "react";

import type { couponData } from "../types/Coupon";

const useCoupon = () => {
  const headers = [
    "Coupon Code",
    "Description",
    "Discount Percentage",
    "Max Discount Amount",
    "Service Using Coupon",
    "Actions",
  ];

  const [coupons, setCoupens] = useState<couponData[]>([]);
  const fetchData = async () => {
    const response: couponData[] = [
      {
        couponCode: "Car Polishing",
        description: "Polish car using these lorem ipsum",
        discount: "12999 ₹",
        maxDiscount: "12999 ₹",
        serviceUsingCoupon: "12 M",
      },
      {
        couponCode: "Bike Wash",
        description: "Full wash service",
        discount: "12999 ₹",
        maxDiscount: "12999 ₹",
        serviceUsingCoupon: "12 M",
      },
    ];
    setCoupens(response);
  };
  const handleEdit = (item: couponData) => {
    console.log("Edit clicked for:", item);
    // You can open a modal or navigate to an edit form
  };

  const handleDelete = (item: couponData) => {
    console.log("Delete clicked for:", item);
    // Show confirmation, then send DELETE request to backend
  };

  // add new service

  const [fields, setFields] = useState([
    {
      name: "coupen_code",
      label: "Coupon Code",
      type: "text",
      placeholder: "Enter Coupon Code",
      value: "",
    },

    {
      name: "description",
      label: "Description",
      type: "text",
      placeholder: "Enter Description",
      value: "",
    },
    {
      name: "discount",
      label: "Discount Percentage",
      type: "text",
      placeholder: "Enter Discount Percentage",
      value: "",
    },
    {
      name: "max_discount",
      label: "Max Discount Amount",
      type: "text",
      placeholder: "Enter Max Discount Amount",
      value: "",
    },
    {
      name: "service_using",
      label: "Service Using Coupon",
      type: "text",
      placeholder: "E.g. Car wash",
      value: "",
    },
  ]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Submitted:", fields);
    // Here you can handle API request
  };

  const handleInputChange = (index: number, event: any) => {
    const newFields = [...fields];
    newFields[index].value = event.target.value;
    setFields(newFields);
  };

  return {
    coupons,
    headers,
    setCoupens,
    fetchData,
    handleEdit,
    handleDelete,
    fields,
    handleInputChange,
    handleSubmit,
  };
};
export default useCoupon;
