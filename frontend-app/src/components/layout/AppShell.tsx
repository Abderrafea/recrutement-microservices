import type { PropsWithChildren, ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { PageWrapper } from './PageWrapper';
import { Sidebar } from './Sidebar';

export function AppShell({ title, eyebrow, actions, children }: PropsWithChildren<{ title: string; eyebrow: string; actions?: ReactNode }>) {
  const { user } = useAuth();

  return (
    <PageWrapper>
      <div className="grid gap-8 lg:grid-cols-[288px,1fr]">
        {user && <Sidebar role={user.role} />}

        <div className="space-y-6">
          <section className="glass-panel section-grid rounded-[36px] border border-white/70 p-8 shadow-panel">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-ink/45">{eyebrow}</p>
                <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">{title}</h1>
              </div>
              {actions}
            </div>
          </section>
          {children}
        </div>
      </div>
    </PageWrapper>
  );
}
