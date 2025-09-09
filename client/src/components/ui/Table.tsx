import React from "react";

interface TableProps {
  headers: string[];
  data: (string | React.ReactNode)[][];
  className?: string;
}

const Table: React.FC<TableProps> = ({ headers, data, className }) => {
  return (
<div className={`overflow-x-auto rounded-xl border max-h-[300px] overflow-y-scroll border-gray-200 ${className}`}>
      <table className="min-w-full text-sm text-gray-700">
        {/* Table Header */}
        <thead>
          <tr className="bg-gray-50 text-gray-500">
            {headers.map((header, index) => (
              <th
                key={index}
                className="sticky top-0 bg-gray-50 scroll-smooth z-10 text-left px-3 py-3 font-medium border-b border-gray-200"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-gray-50 border-b border-gray-100"
              >
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-3 py-3">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={headers.length}
                className="text-center py-4 text-gray-400"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

  );
};

export default Table;
