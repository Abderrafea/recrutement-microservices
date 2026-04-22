import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <label className="flex flex-col gap-2 text-sm font-medium text-ink">
        {label && <span>{label}</span>}
        <input
          ref={ref}
          className={cn(
            'rounded-3xl border border-ink/10 bg-white/90 px-4 py-3 text-sm outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20',
            className,
          )}
          {...props}
        />
        {error && <span className="text-xs text-rose-600">{error}</span>}
      </label>
    );
  },
);

Input.displayName = 'Input';
