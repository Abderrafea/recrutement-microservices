import type { PropsWithChildren } from 'react';
import { cn } from '../../utils/cn';

export function Panel({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <section className={cn('glass-panel rounded-[32px] border border-white/70 p-6 shadow-panel', className)}>
      {children}
    </section>
  );
}
