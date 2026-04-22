import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getApplicationsReport, getJobsReport, getOverview } from '../../api/reports.api';
import { AppShell } from '../../components/layout/AppShell';
import { Panel } from '../../components/common/Panel';
import { Spinner } from '../../components/common/Spinner';
import { StatCard } from '../../components/common/StatCard';

export function AdminDashboard() {
  const overviewQuery = useQuery({ queryKey: ['reports', 'overview'], queryFn: getOverview });
  const jobsQuery = useQuery({ queryKey: ['reports', 'jobs'], queryFn: getJobsReport });
  const applicationsQuery = useQuery({ queryKey: ['reports', 'applications'], queryFn: getApplicationsReport });

  if (overviewQuery.isLoading || jobsQuery.isLoading || applicationsQuery.isLoading) {
    return (
      <AppShell eyebrow="Analytique admin" title="Vue d'ensemble de la plateforme">
        <Spinner />
      </AppShell>
    );
  }

  const overview = overviewQuery.data!;
  const jobs = jobsQuery.data!;
  const applications = applicationsQuery.data!;

  return (
    <AppShell eyebrow="Analytique admin" title="Vue d'ensemble de la plateforme">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total utilisateurs" value={overview.totalUsers} />
        <StatCard label="Total offres" value={overview.totalJobOffers} />
        <StatCard label="Total candidatures" value={overview.totalApplications} />
        <StatCard label="Taux d'acceptation" value={`${Math.round(overview.acceptanceRate * 100)}%`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel className="h-96">
          <h3 className="font-display text-2xl text-ink">Candidatures par statut</h3>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={Object.entries(applications.applicationsByStatus).map(([name, value]) => ({ name, value }))} dataKey="value" nameKey="name" outerRadius={110} fill="#c9694d" />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="h-96">
          <h3 className="font-display text-2xl text-ink">Inscriptions dans le temps</h3>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={Object.entries(overview.registrationsByDate).map(([date, value]) => ({ date, value }))}>
                <XAxis dataKey="date" hide />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#0f7d82" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel className="h-96">
        <h3 className="font-display text-2xl text-ink">Offres par type de contrat</h3>
        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={Object.entries(jobs.jobsByContractType).map(([name, value]) => ({ name, value }))}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0f7d82" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </AppShell>
  );
}
