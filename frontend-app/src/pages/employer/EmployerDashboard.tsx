import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AppShell } from '../../components/layout/AppShell';
import { Panel } from '../../components/common/Panel';
import { StatCard } from '../../components/common/StatCard';
import { Spinner } from '../../components/common/Spinner';
import { getEmployerReport } from '../../api/reports.api';
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
    <AppShell eyebrow="Employer command center" title="Keep every hiring lane moving">
      {reportQuery.isLoading ? (
        <Spinner />
      ) : report ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Active jobs" value={report.openJobs} />
            <StatCard label="Applications received" value={report.totalApplicationsReceived} />
            <StatCard label="Acceptance rate" value={`${Math.round(report.acceptanceRate * 100)}%`} />
            <StatCard label="Avg. apps per job" value={report.averageApplicationsPerJob.toFixed(2)} />
          </div>

          <Panel className="h-96">
            <h3 className="font-display text-2xl text-ink">Applications per job</h3>
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
      ) : null}
    </AppShell>
  );
}
