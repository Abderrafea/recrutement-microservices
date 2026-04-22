import { forwardRef, type TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <label className="flex flex-col gap-2 text-sm font-medium text-ink">
        {label && <span>{label}</span>}
        <textarea
          ref={ref}
          className="min-h-32 rounded-[28px] border border-ink/10 bg-white/90 px-4 py-3 text-sm outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20"
          {...props}
        />
        {error && <span className="text-xs text-rose-600">{error}</span>}
      </label>
    );
  },
);

TextArea.displayName = 'TextArea';
