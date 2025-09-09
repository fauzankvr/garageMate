import React, { useState, useEffect } from "react";

interface Customer {
  name: string;
  phone: string;
}

interface Props {
  customers: Customer[];
  onSelect: (customer: Customer) => void;
}

const CustomerSearch: React.FC<Props> = ({ customers, onSelect }) => {
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<Customer[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const query = search.toLowerCase();
    const result = customers.filter(
      (cust) =>
        cust.name.toLowerCase().includes(query) ||
        cust.phone.includes(query)
    );
    setFiltered(result);
  }, [search, customers]);

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search by name or phone"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => setShowDropdown(true)}
        className="w-full px-3 py-2 border rounded-md"
      />

      {showDropdown && filtered.length > 0 && (
        <ul className="absolute z-10 bg-white border w-full mt-1 rounded-md shadow max-h-48 overflow-y-auto">
          {filtered.map((cust, idx) => (
            <li
              key={idx}
              onClick={() => {
                onSelect(cust);
                setSearch("");
                setShowDropdown(false);
              }}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {cust.name} — {cust.phone}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomerSearch;
