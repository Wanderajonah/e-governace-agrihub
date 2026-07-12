import { Search } from "lucide-react";

function SearchBar({
  placeholder = "Search...",
  className = "",
  value,
  onChange,
}: {
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
      />
    </div>
  );
}

export default SearchBar;
