import type { SelectHTMLAttributes } from 'react';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export function SelectField({ label, options, error, ...props }: SelectFieldProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-ink">
      {label && <span>{label}</span>}
      <select
        className="rounded-3xl border border-ink/10 bg-white/90 px-4 py-3 text-sm outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20"
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </label>
  );
}
