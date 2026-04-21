import { Building2, Search, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Spinner } from '../../components/common/Spinner';
import { StatCard } from '../../components/common/StatCard';
import { JobCard } from '../../components/jobs/JobCard';
import { useJobs } from '../../hooks/useJobs';

export function HomePage() {
  const jobsQuery = useJobs({ page: 0, size: 6 });
  const jobs = jobsQuery.data?.content ?? [];
  const companiesHiring = new Set(jobs.map((job) => job.company)).size;

  return (
    <PageWrapper>
      <section className="grid gap-8 lg:grid-cols-[1.35fr,0.85fr]">
        <div className="glass-panel section-grid rounded-[40px] border border-white/70 p-8 shadow-panel md:p-12">
          <p className="text-xs uppercase tracking-[0.26em] text-ink/45">Recruitment platform</p>
          <h1 className="mt-5 max-w-3xl font-display text-5xl leading-tight text-ink md:text-7xl">
            Hiring that feels sharper, calmer, and easier to run.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/70">
            Discover live opportunities, manage applications, and keep every role in one polished workflow.
          </p>

          <div className="mt-8 grid gap-4 rounded-[32px] bg-white/80 p-4 shadow-sm md:grid-cols-[1fr,1fr,auto]">
            <div className="rounded-[24px] border border-ink/10 bg-mist/70 px-4 py-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-ink/50"><Search size={14} /> Search roles</div>
              <p className="mt-3 text-sm text-ink/70">Browse engineering, product, design, and operations openings.</p>
            </div>
            <div className="rounded-[24px] border border-ink/10 bg-mist/70 px-4 py-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-ink/50"><Building2 size={14} /> Employer space</div>
              <p className="mt-3 text-sm text-ink/70">Publish openings, review candidates, and move interviews forward.</p>
            </div>
            <div className="flex flex-col gap-3">
              <Link to="/jobs"><Button fullWidth>Explore jobs</Button></Link>
              <Link to="/register"><Button variant="secondary" fullWidth>Post a job</Button></Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <StatCard label="Open roles" value={jobsQuery.data?.totalElements ?? 0} hint="Fresh positions routed through the gateway." />
          <StatCard label="Companies hiring" value={companiesHiring} hint="Visible in the featured rotation right now." />
          <div className="glass-panel rounded-[32px] border border-white/70 p-6 shadow-panel">
            <div className="flex items-center gap-3 text-coral">
              <Sparkles size={18} />
              <span className="text-sm font-semibold uppercase tracking-[0.24em]">Platform promise</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-ink/70">
              One experience for visitors, candidates, employers, and administrators, powered by the microservices stack sitting in this repo.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-ink/45">Featured openings</p>
            <h2 className="mt-2 font-display text-4xl text-ink">Latest roles on deck</h2>
          </div>
          <Link to="/jobs" className="text-sm font-semibold text-coral">View all jobs</Link>
        </div>
        {jobsQuery.isLoading ? (
          <Spinner />
        ) : jobs.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} compact />
            ))}
          </div>
        ) : (
          <EmptyState title="No featured jobs yet" description="Once the services are running with seed data, this section will spotlight the newest openings." />
        )}
      </section>
    </PageWrapper>
  );
}
