"use client";

interface DropdownProps {
  options: { label: string; value: string }[];
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  className?: string;
  label?: string;
}

export function Dropdown({
   options,
   placeholder = "Select...",
   value,
   onChange,
   className = "",
   label,
 }: DropdownProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-semibold text-[var(--foreground)]">
          {label}
        </label>
      )}
      <select
        className={`w-full px-3.5 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all cursor-pointer ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
