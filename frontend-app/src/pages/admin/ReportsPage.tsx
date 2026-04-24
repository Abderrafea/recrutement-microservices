import { useQuery } from '@tanstack/react-query';
import { getApplicationsReport, getJobsReport } from '../../api/reports.api';
import { Panel } from '../../components/common/Panel';
import { Spinner } from '../../components/common/Spinner';
import { AppShell } from '../../components/layout/AppShell';

export function ReportsPage() {
  const jobsQuery = useQuery({ queryKey: ['reports', 'jobs', 'full'], queryFn: getJobsReport });
  const applicationsQuery = useQuery({ queryKey: ['reports', 'applications', 'full'], queryFn: getApplicationsReport });
  const applicationsByJobDetails = applicationsQuery.data?.applicationsByJobDetails
    ?? Object.entries(applicationsQuery.data?.applicationsByJob ?? {}).map(([jobId, total]) => ({
      jobId: Number(jobId),
      title: `Offre #${jobId}`,
      company: null,
      totalApplications: total,
    }));

  return (
    <AppShell eyebrow="Analytique admin" title="Rapports detailles">
      {jobsQuery.isLoading || applicationsQuery.isLoading ? (
        <Spinner />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <Panel>
            <h3 className="font-display text-2xl text-ink">Top employeurs par candidatures recues</h3>
            <div className="mt-5 space-y-3">
              {jobsQuery.data?.topEmployers.map((employer) => (
                <div key={employer.employerId} className="rounded-3xl border border-ink/10 px-4 py-4">
                  <div className="font-semibold text-ink">{employer.companyName}</div>
                  <div className="mt-1 text-sm text-ink/60">
                    {employer.totalJobsPosted} offres publiees • {employer.applicationsReceived} candidatures recues
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <h3 className="font-display text-2xl text-ink">Candidatures par offre</h3>
            <div className="mt-5 space-y-3">
              {applicationsByJobDetails.map((job) => (
                <div key={job.jobId} className="rounded-3xl border border-ink/10 px-4 py-4">
                  <div className="font-semibold text-ink">{job.title}</div>
                  <div className="mt-1 text-sm text-ink/60">
                    {job.company ? `${job.company} • ` : ''}{job.totalApplications} candidatures
                  </div>
                  <div className="mt-1 text-xs text-ink/45">Offre #{job.jobId}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}
    </AppShell>
  );
}
