function Input({
  label,
  placeholder,
  type = "text",
  required,
  value,
  onChange,
}: {
  label?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
      />
    </div>
  );
}

export default Input;
