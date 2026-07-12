import React from "react";

function Table({
  headers,
  children,
  headerClassNames,
}: {
  headers: string[];
  children: React.ReactNode;
  headerClassNames?: string[];
}) {
  return (
    <div className="overflow-x-auto">
      <table
        className="w-full text-sm"
        style={{ borderCollapse: "separate", borderSpacing: 0 }}
      >
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/80">
            {headers.map((h, i) => (
              <th
                key={h}
                className={`text-left text-xs font-semibold text-gray-500 uppercase tracking-wider h-[52px] px-6 whitespace-nowrap align-middle ${headerClassNames?.[i] ?? ""}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">{children}</tbody>
      </table>
    </div>
  );
}

export default Table;
