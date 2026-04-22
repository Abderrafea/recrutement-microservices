import { Building2, Search, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Spinner } from '../../components/common/Spinner';
import { StatCard } from '../../components/common/StatCard';
import { JobCard } from '../../components/jobs/JobCard';
import { useJobs } from '../../hooks/useJobs';
import { useAuth } from '../../hooks/useAuth';

export function HomePage() {
  const jobsQuery = useJobs({ page: 0, size: 6 });
  const jobs = jobsQuery.data?.content ?? [];
  const companiesHiring = new Set(jobs.map((job) => job.company)).size;
  const { user, isAuthenticated } = useAuth();

  // Role-aware CTAs
  const secondaryCta = !isAuthenticated ? (
    <Link to="/register"><Button variant="secondary" fullWidth>Commencer</Button></Link>
  ) : user?.role === 'EMPLOYER' ? (
    <Link to="/employer/jobs/new"><Button variant="secondary" fullWidth>Publier une offre</Button></Link>
  ) : user?.role === 'CANDIDATE' ? (
    <Link to="/candidate/applications"><Button variant="secondary" fullWidth>Mes candidatures</Button></Link>
  ) : (
    <Link to="/admin/dashboard"><Button variant="secondary" fullWidth>Tableau de bord</Button></Link>
  );

  return (
    <PageWrapper>
      <section className="grid gap-8 lg:grid-cols-[1.35fr,0.85fr]">
        <div className="glass-panel section-grid rounded-[40px] border border-white/70 p-8 shadow-panel md:p-12">
          <p className="text-xs uppercase tracking-[0.26em] text-ink/45">Plateforme de recrutement</p>
          <h1 className="mt-5 max-w-3xl font-display text-5xl leading-tight text-ink md:text-7xl">
            Un recrutement plus fluide, plus serein et plus efficace.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/70">
            Découvrez les opportunités disponibles, gérez vos candidatures et centralisez chaque poste dans un seul workflow.
          </p>

          <div className="mt-8 grid gap-4 rounded-[32px] bg-white/80 p-4 shadow-sm md:grid-cols-[1fr,1fr,auto]">
            <div className="rounded-[24px] border border-ink/10 bg-mist/70 px-4 py-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-ink/50"><Search size={14} /> Rechercher</div>
              <p className="mt-3 text-sm text-ink/70">Parcourez les offres en ingénierie, produit, design et opérations.</p>
            </div>
            <div className="rounded-[24px] border border-ink/10 bg-mist/70 px-4 py-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-ink/50"><Building2 size={14} /> Espace employeur</div>
              <p className="mt-3 text-sm text-ink/70">Publiez des offres, examinez les candidats et faites avancer les entretiens.</p>
            </div>
            <div className="flex flex-col gap-3">
              <Link to="/jobs"><Button fullWidth>Explorer les offres</Button></Link>
              {secondaryCta}
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <StatCard label="Postes ouverts" value={jobsQuery.data?.totalElements ?? 0} hint="Postes disponibles via la passerelle." />
          <StatCard label="Entreprises qui recrutent" value={companiesHiring} hint="Visibles dans la rotation actuelle." />
          <div className="glass-panel rounded-[32px] border border-white/70 p-6 shadow-panel">
            <div className="flex items-center gap-3 text-coral">
              <Sparkles size={18} />
              <span className="text-sm font-semibold uppercase tracking-[0.24em]">Notre promesse</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-ink/70">
              Une expérience unique pour les visiteurs, candidats, employeurs et administrateurs, propulsée par l'architecture microservices de ce projet.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-ink/45">Offres en vedette</p>
            <h2 className="mt-2 font-display text-4xl text-ink">Derniers postes disponibles</h2>
          </div>
          <Link to="/jobs" className="text-sm font-semibold text-coral">Voir toutes les offres</Link>
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
          <EmptyState title="Aucune offre en vedette" description="Une fois les services démarrés avec des données, cette section mettra en avant les dernières offres." />
        )}
      </section>
    </PageWrapper>
  );
}
