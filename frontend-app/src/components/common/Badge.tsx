import type { PropsWithChildren } from 'react';
import { cn } from '../../utils/cn';

export function Badge({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <span className={cn('inline-flex rounded-full bg-ink/5 px-3 py-1 text-xs font-semibold text-ink', className)}>
      {children}
    </span>
  );
}
