import { useState } from "react";
import Header from "../components/layout/headers/Header";
import { initialCompanies } from "../assets/assets";
import {  Edit2, Trash } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";

const CompanyTable = () => {
  const [companies, setCompanies] = useState(initialCompanies);

  const handleDelete = (id: number) => {
    setCompanies(companies.filter((company) => company.id !== id));
  };

  const handleEdit = (id: number) => {
    alert(`Edit company with ID: {id}`);
  };

  return (
    <div className="h-screen">

      <Header />
<div className="flex">
  <Sidebar/>
      <div className="max-w-4xl mx-auto mt-10 bg-white rounded-lg shadow-sm border border-gray-200 h-[400px] overflow-scroll overflow-x-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr className="text-sm text-gray-700">
              <th className="p-4 font-semibold">Company Name</th>
              <th className="p-4 font-semibold">Contact Email</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company, index) => (
              <tr
                key={company.id}
                className={`text-gray-700 {
                  index !== companies.length - 1
                    ? "border-b border-gray-200"
                    : ""
                }`}
              >
                <td className="p-4">{company.name}</td>
                <td className="p-4">
                  <a
                    href={`mailto:{company.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {company.email}
                  </a>
                </td>
                <td className="p-4">
                  <span
                    className={`inline-block px-4 py-1 rounded-full text-sm font-medium {
                      company.status === "Active"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {company.status}
                  </span>
                </td>
                <td className="p-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(company.id)}
                      className="text-black hover:underline flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3 text-blue-600 " /> Edit
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(company.id)}
                      className="text-red-500 hover:underline flex items-center gap-1"
                    >
                      <Trash className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></div>
    </div>
  );
};

export default CompanyTable;
