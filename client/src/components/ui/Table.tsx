import React from "react";

interface TableProps {
  headers: string[];
  data: (string | number | React.ReactNode)[][];
  className?: string;
}

const Table: React.FC<TableProps> = ({ headers, data, className }) => {
  return (
    <div className={`bg-white rounded-lg shadow overflow-x-auto ${className}`}>
      <table
        className="min-w-full divide-y divide-gray-200 text-sm text-gray-700"
        role="table"
      >
        {/* Table Header */}
        <thead className="bg-gray-50">
          <tr className="text-gray-500">
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="sticky top-0 bg-gray-50 z-10 text-left px-6 py-3 font-medium text-xs uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-gray-200">
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr
                key={`row-${rowIndex}`}
                className="hover:bg-gray-50"
                role="row"
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={`cell-${rowIndex}-${cellIndex}`}
                    className="px-6 py-4 whitespace-nowrap"
                    role="cell"
                  >
                    <div
                      className="truncate max-w-xs"
                      title={typeof cell === "string" ? cell : undefined}
                    >
                      {cell}
                    </div>
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={headers.length}
                className="text-center py-6 text-gray-400"
                role="cell"
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
