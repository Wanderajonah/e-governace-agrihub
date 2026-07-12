import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  trend,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  color: string;
  trend?: number;
  onClick?: () => void;
}) {
  return (
    <div
      className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}>
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: color + "18" }}
      >
        <Icon size={22} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-2xl font-bold text-gray-900 leading-none mb-1">
          {value}
        </p>
        <div className="flex items-center gap-1 text-xs">
          {trend !== undefined &&
            (trend >= 0 ? (
              <ArrowUp size={11} className="text-green-600" />
            ) : (
              <ArrowDown size={11} className="text-red-500" />
            ))}
          <span
            className={
              trend !== undefined
                ? trend >= 0
                  ? "text-green-600"
                  : "text-red-500"
                : "text-gray-400"
            }
          >
            {sub}
          </span>
        </div>
      </div>
    </div>
  );
}

export default StatCard;
