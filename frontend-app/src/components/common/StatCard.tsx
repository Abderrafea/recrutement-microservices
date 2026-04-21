import { ArrowUpRight } from 'lucide-react';
import { Panel } from './Panel';

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Panel className="fade-rise">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-ink/45">{label}</p>
          <h3 className="mt-3 font-display text-4xl text-ink">{value}</h3>
          {hint && <p className="mt-2 text-sm text-ink/65">{hint}</p>}
        </div>
        <span className="rounded-full bg-coral/15 p-3 text-coral">
          <ArrowUpRight size={18} />
        </span>
      </div>
    </Panel>
  );
}
