import { Search } from "lucide-react";

const SearchBar = () => {
  return (
    <div className="bg-gray-100 rounded-lg flex items-center px-4 py-2 w-full max-w-xl m-4">
      <Search className="text-gray-500 w-5 h-5 mr-2" />
      <input
        type="text"
        placeholder="Search"
        className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-500"
      />
    </div>
  );
};

export default SearchBar;
