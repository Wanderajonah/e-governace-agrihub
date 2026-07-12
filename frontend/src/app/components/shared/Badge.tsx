function Badge({ label, color: _color }: { label: string; color: string }) {
  const map: Record<string, string> = {
    Active: "bg-emerald-50 text-emerald-700",
    Inactive: "bg-gray-100 text-gray-600",
    Pending: "bg-amber-50 text-amber-700",
    "Under Review": "bg-blue-50 text-blue-700",
    Administrator: "bg-purple-50 text-purple-700",
    "Market Officer": "bg-blue-50 text-blue-700",
    Inspector: "bg-orange-50 text-orange-700",
    "Government Officer": "bg-teal-50 text-teal-700",
  };
  const cls = map[label] ?? "bg-gray-100 text-gray-600";
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium leading-none ${cls}`}
    >
      {label}
    </span>
  );
}

export default Badge;
