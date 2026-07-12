import React from "react";

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={`py-3.5 px-6 text-[13px] text-gray-700 align-middle ${className}`}
    >
      {children}
    </td>
  );
}

export default Td;
