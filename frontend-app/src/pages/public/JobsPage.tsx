import { startTransition, useDeferredValue, useState } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { EmptyState } from '../../components/common/EmptyState';
import { JobCard } from '../../components/jobs/JobCard';
import { JobFilters } from '../../components/jobs/JobFilters';
import { useJobs } from '../../hooks/useJobs';
import type { JobSearchParams } from '../../types/job.types';

export function JobsPage() {
  const [filters, setFilters] = useState<JobSearchParams>({ page: 0, size: 9 });
  const deferredQuery = useDeferredValue(filters.query);
  const jobsQuery = useJobs({ ...filters, query: deferredQuery });

  return (
    <PageWrapper>
      <section className="glass-panel rounded-[36px] border border-white/70 p-8 shadow-panel">
        <p className="text-xs uppercase tracking-[0.24em] text-ink/45">Parcourir tous les postes ouverts</p>
        <div className="mt-5 flex flex-col gap-4 md:flex-row">
          <Input
            className="flex-1"
            label="Mot-clé"
            placeholder="Rechercher par titre ou description"
            value={filters.query ?? ''}
            onChange={(event) =>
              startTransition(() => {
                setFilters((current) => ({ ...current, query: event.target.value, page: 0 }));
              })
            }
          />
          <div className="flex items-end">
            <Button variant="secondary" onClick={() => setFilters((current) => ({ ...current, page: 0 }))}>
              Actualiser
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[280px,1fr]">
        <JobFilters filters={filters} setFilters={setFilters} />

        <div className="space-y-6">
          {jobsQuery.isLoading ? (
            <Spinner />
          ) : jobsQuery.data?.content.length ? (
            <>
              <div className="grid gap-6 xl:grid-cols-2">
                {jobsQuery.data.content.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
              <div className="flex items-center justify-between rounded-[28px] bg-white/70 px-5 py-4 text-sm text-ink/65">
                <span>
                  Page {(jobsQuery.data.number ?? 0) + 1} sur {jobsQuery.data.totalPages || 1}
                </span>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    disabled={(filters.page ?? 0) === 0}
                    onClick={() => setFilters((current) => ({ ...current, page: Math.max((current.page ?? 0) - 1, 0) }))}
                  >
                    Précédent
                  </Button>
                  <Button
                    disabled={(filters.page ?? 0) + 1 >= (jobsQuery.data.totalPages || 1)}
                    onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 0) + 1 }))}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <EmptyState title="Aucune offre ne correspond" description="Essayez d'élargir vos critères de recherche ou de retirer un filtre pour afficher plus de résultats." />
          )}
        </div>
      </section>
    </PageWrapper>
  );
}
