import { useState } from "react";

const SearchInput = ({
  placeholder,
  searchKey,
  data,
  onSelect,
  onAddNew,
}: {
  placeholder: string;
  searchKey: string;
  data: any[];
  onSelect: (item: any) => void;
  onAddNew: (input: string) => void;
}) => {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const filtered = query
    ? data.filter((item) =>
        item[searchKey]?.toLowerCase().includes(query.toLowerCase())
      )
    : data;

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        className="border px-4 py-2 w-full rounded-md"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
      />

      {showDropdown && (
        <ul className="absolute z-10 bg-white w-full border rounded-md shadow-md max-h-60 overflow-y-auto">
          {filtered.map((item, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onSelect(item);
                setQuery("");
                setShowDropdown(false);
              }}
            >
              {item[searchKey]}
            </li>
          ))}

          {/* Always show 'Create New' option at the bottom */}
          <li
            className="px-4 py-2 text-blue-600 hover:bg-blue-50 cursor-pointer border-t"
            onClick={() => {
              onAddNew(query);
              setQuery("");
              setShowDropdown(false);
            }}
          >
            + Create New {query ? `"${query}"` : ""}
          </li>
        </ul>
      )}
    </div>
  );
};

export default SearchInput;

