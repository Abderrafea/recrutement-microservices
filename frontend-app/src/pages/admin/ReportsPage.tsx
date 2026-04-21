import { useQuery } from '@tanstack/react-query';
import { getApplicationsReport, getJobsReport } from '../../api/reports.api';
import { AppShell } from '../../components/layout/AppShell';
import { Panel } from '../../components/common/Panel';
import { Spinner } from '../../components/common/Spinner';

export function ReportsPage() {
  const jobsQuery = useQuery({ queryKey: ['reports', 'jobs', 'full'], queryFn: getJobsReport });
  const applicationsQuery = useQuery({ queryKey: ['reports', 'applications', 'full'], queryFn: getApplicationsReport });

  return (
    <AppShell eyebrow="Admin analytics" title="Deeper reporting cuts">
      {jobsQuery.isLoading || applicationsQuery.isLoading ? (
        <Spinner />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <Panel>
            <h3 className="font-display text-2xl text-ink">Top employers by applications received</h3>
            <div className="mt-5 space-y-3">
              {jobsQuery.data?.topEmployers.map((employer) => (
                <div key={employer.employerId} className="rounded-3xl border border-ink/10 px-4 py-4">
                  <div className="font-semibold text-ink">{employer.companyName}</div>
                  <div className="mt-1 text-sm text-ink/60">
                    {employer.totalJobsPosted} jobs posted • {employer.applicationsReceived} applications received
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <h3 className="font-display text-2xl text-ink">Applications by job</h3>
            <div className="mt-5 space-y-3">
              {Object.entries(applicationsQuery.data?.applicationsByJob ?? {}).map(([jobId, total]) => (
                <div key={jobId} className="rounded-3xl border border-ink/10 px-4 py-4">
                  <div className="font-semibold text-ink">Job #{jobId}</div>
                  <div className="mt-1 text-sm text-ink/60">{total} applications</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}
    </AppShell>
  );
}
