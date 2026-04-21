import { Panel } from './Panel';

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Panel className="text-center">
      <h3 className="font-display text-2xl text-ink">{title}</h3>
      <p className="mt-3 text-sm text-ink/70">{description}</p>
    </Panel>
  );
}
