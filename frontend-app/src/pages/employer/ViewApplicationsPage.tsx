import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { updateApplicationStatus } from '../../api/applications.api';
import { ApplicationTable } from '../../components/applications/ApplicationTable';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { AppShell } from '../../components/layout/AppShell';
import { useJobApplications } from '../../hooks/useApplications';

export function ViewApplicationsPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const applicationsQuery = useJobApplications(Number(id));

  const updateMutation = useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: number; status: 'REVIEWED' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED' }) =>
      updateApplicationStatus(applicationId, { status }),
    onSuccess: () => {
      toast.success('Application status updated.');
      void queryClient.invalidateQueries({ queryKey: ['applications', 'job', Number(id)] });
    },
  });

  return (
    <AppShell eyebrow="Employer command center" title="Review incoming candidates">
      {applicationsQuery.isLoading ? (
        <Spinner />
      ) : (
        <ApplicationTable
          applications={applicationsQuery.data ?? []}
          renderActions={(application) => (
            <div className="flex flex-wrap gap-2">
              {(['REVIEWED', 'INTERVIEW', 'ACCEPTED', 'REJECTED'] as const).map((status) => (
                <Button key={status} variant="ghost" onClick={() => updateMutation.mutate({ applicationId: application.id, status })}>
                  {status}
                </Button>
              ))}
              <a
                href={`${import.meta.env.VITE_API_BASE_URL || ''}/api/users/${application.candidateId}/cv`}
                className="inline-flex items-center justify-center rounded-full border border-ink/15 px-4 py-3 text-xs font-semibold text-ink"
              >
                Download CV
              </a>
            </div>
          )}
        />
      )}
    </AppShell>
  );
}
