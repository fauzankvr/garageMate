import { useEffect } from "react";
import UserActions from "../components/layout/headers/UserActions";
import Sidebar from "../components/layout/Sidebar";
import Table from "../components/ui/Table";

import InputField from "../components/common/input/input";
import useCoupon from "../hooks/useCoupon";


const Coupen = () => {
  const {
    coupons,
    headers,
    fetchData,
    handleEdit,
    handleDelete,
    fields,
    handleInputChange,
    handleSubmit,
  } = useCoupon();

  // Simulate API call
  useEffect(() => {
    fetchData();
  }, []);

  // Convert backend data to table rows
  const data = coupons.map((item) => [
    item.couponCode,
    item.description,
    item.discount,
    item.maxDiscount,
    item.serviceUsingCoupon,

    <div className="space-x-2">
      <button
        onClick={() => handleEdit(item)}
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
  ]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="hidden md:block  bg-white border-r shadow">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col w-full md:w-auto p-4 sm:p-6 lg:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            Coupens
          </h1>
          <UserActions />
        </div>

        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <Table headers={headers} data={data} />
        </div>
        <div className="p-6 bg-white rounded-2xl mt-6 ">
          <h2 className="text-xl font-bold mb-4">Add New Coupen</h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Left Column */}
            <div className="space-y-4">
              {/* First 2 fields */}
              {fields.slice(0, 2).map((field, index) => (
                <InputField
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  type={field.type}
                  value={field.value}
                  placeholder={field.placeholder}
                  onChange={(e) => handleInputChange(index, e)}
                  className="w-full"
                />
              ))}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Third field (e.g., description) */}
              <InputField
                key={fields[2].name}
                label={fields[2].label}
                name={fields[2].name}
                type={fields[2].type}
                value={fields[2].value}
                placeholder={fields[2].placeholder}
                onChange={(e) => handleInputChange(2, e)}
                className="w-full"
              />

              {/* Last two inputs in one row */}
              <div className="flex flex-col md:flex-row gap-4">
                {fields.slice(3, 5).map((field, index) => (
                  <InputField
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    type={field.type}
                    value={field.value}
                    placeholder={field.placeholder}
                    onChange={(e) => handleInputChange(index + 3, e)}
                    className="w-full"
                  />
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="col-span-2 flex justify-center">
              <button
                type="submit"
                className="bg-black hover:bg-neutral-900 text-white px-8 py-3 rounded-full font-semibold transition"
              >
                Create
              </button>
            </div>
          </form>
        </div>
        {/*  */}
       
      </div>
    </div>
  );
};

export default Coupen;
