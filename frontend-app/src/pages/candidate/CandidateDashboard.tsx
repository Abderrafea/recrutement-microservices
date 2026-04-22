import { Link } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { ApplicationTable } from '../../components/applications/ApplicationTable';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { StatCard } from '../../components/common/StatCard';
import { Spinner } from '../../components/common/Spinner';
import { useCandidateApplications } from '../../hooks/useApplications';
import { useAuth } from '../../hooks/useAuth';

export function CandidateDashboard() {
  const { user } = useAuth();
  const applicationsQuery = useCandidateApplications(user?.id);
  const applications = applicationsQuery.data ?? [];

  const stats = {
    total: applications.length,
    pending: applications.filter((application) => application.status === 'PENDING').length,
    interviews: applications.filter((application) => application.status === 'INTERVIEW').length,
    accepted: applications.filter((application) => application.status === 'ACCEPTED').length,
  };

  return (
    <AppShell
      eyebrow="Centre de commande candidat"
      title="Suivez votre progression"
      actions={<Link to="/jobs"><Button>Parcourir les offres</Button></Link>}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total candidatures" value={stats.total} />
        <StatCard label="En attente de revue" value={stats.pending} />
        <StatCard label="Entretiens" value={stats.interviews} />
        <StatCard label="Acceptées" value={stats.accepted} />
      </div>

      {applicationsQuery.isLoading ? (
        <Spinner />
      ) : applications.length ? (
        <ApplicationTable applications={applications.slice(0, 5)} />
      ) : (
        <EmptyState title="Aucune candidature" description="Dès que vous postulerez à une offre, votre activité récente apparaîtra ici." />
      )}
    </AppShell>
  );
}
