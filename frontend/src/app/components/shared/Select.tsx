function Select({
  options,
  className = "",
  value,
  onChange,
}: {
  options: string[];
  className?: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      className={`text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition ${className}`}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export default Select;
