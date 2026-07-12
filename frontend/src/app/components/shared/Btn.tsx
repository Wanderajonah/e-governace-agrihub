import React from "react";

function Btn({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md";
  icon?: React.ElementType;
  onClick?: () => void;
  className?: string;
}) {
  const variants = {
    primary: "bg-green-700 hover:bg-green-800 text-white shadow-sm",
    secondary: "bg-green-500 hover:bg-green-600 text-white shadow-sm",
    outline: "border border-gray-200 hover:bg-gray-50 text-gray-700",
    ghost: "hover:bg-gray-100 text-gray-600",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-sm",
  };
  const sizes = {
    sm: "text-xs px-3 py-2.5 gap-1.5",
    md: "text-sm px-4 py-2.5 gap-2",
  };
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center rounded-lg font-medium transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {Icon && <Icon size={size === "sm" ? 13 : 15} />}
      {children}
    </button>
  );
}

export default Btn;
