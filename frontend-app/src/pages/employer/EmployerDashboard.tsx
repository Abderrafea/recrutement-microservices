import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getEmployerReport } from '../../api/reports.api';
import { Panel } from '../../components/common/Panel';
import { Spinner } from '../../components/common/Spinner';
import { StatCard } from '../../components/common/StatCard';
import { AppShell } from '../../components/layout/AppShell';
import { useAuth } from '../../hooks/useAuth';

export function EmployerDashboard() {
  const { user } = useAuth();
  const reportQuery = useQuery({
    queryKey: ['reports', 'employer', user?.id],
    queryFn: () => getEmployerReport(user!.id),
    enabled: Boolean(user?.id),
  });

  const report = reportQuery.data;

  return (
    <AppShell eyebrow="Centre de commande employeur" title="Gardez le cap sur vos recrutements">
      {reportQuery.isLoading ? (
        <Spinner />
      ) : reportQuery.isError ? (
        <Panel>Impossible de charger le tableau de bord employeur pour le moment.</Panel>
      ) : report ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Offres actives" value={report.openJobs} />
            <StatCard label="Candidatures recues" value={report.totalApplicationsReceived} />
            <StatCard label="Taux d'acceptation" value={`${Math.round(report.acceptanceRate * 100)}%`} />
            <StatCard label="Moy. cand. / offre" value={report.averageApplicationsPerJob.toFixed(2)} />
          </div>

          <Panel className="h-96">
            <h3 className="font-display text-2xl text-ink">Candidatures par offre</h3>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.jobPerformance}>
                  <XAxis dataKey="title" hide />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="applications" fill="#0f7d82" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </>
      ) : (
        <Panel>Aucune donnee employeur disponible.</Panel>
      )}
    </AppShell>
  );
}
