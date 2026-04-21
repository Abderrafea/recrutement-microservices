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
      eyebrow="Candidate command center"
      title="Track your momentum"
      actions={<Link to="/jobs"><Button>Browse jobs</Button></Link>}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total applications" value={stats.total} />
        <StatCard label="Pending review" value={stats.pending} />
        <StatCard label="Interviews" value={stats.interviews} />
        <StatCard label="Accepted" value={stats.accepted} />
      </div>

      {applicationsQuery.isLoading ? (
        <Spinner />
      ) : applications.length ? (
        <ApplicationTable applications={applications.slice(0, 5)} />
      ) : (
        <EmptyState title="No applications yet" description="Once you apply to a role, your recent activity will appear here." />
      )}
    </AppShell>
  );
}
