import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AppShell } from '../../components/layout/AppShell';
import { ApplicationTable } from '../../components/applications/ApplicationTable';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Spinner } from '../../components/common/Spinner';
import { withdrawApplication } from '../../api/applications.api';
import { useCandidateApplications } from '../../hooks/useApplications';
import { useAuth } from '../../hooks/useAuth';

export function MyApplicationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const applicationsQuery = useCandidateApplications(user?.id);

  const withdrawMutation = useMutation({
    mutationFn: withdrawApplication,
    onSuccess: () => {
      toast.success('Application withdrawn.');
      void queryClient.invalidateQueries({ queryKey: ['applications', 'candidate', user?.id] });
    },
    onError: () => toast.error('Unable to withdraw the application.'),
  });

  return (
    <AppShell eyebrow="Candidate command center" title="Your application pipeline">
      {applicationsQuery.isLoading ? (
        <Spinner />
      ) : applicationsQuery.data?.length ? (
        <ApplicationTable
          applications={applicationsQuery.data}
          renderActions={(application) =>
            application.status === 'PENDING' ? (
              <Button variant="danger" onClick={() => withdrawMutation.mutate(application.id)}>
                Withdraw
              </Button>
            ) : null
          }
        />
      ) : (
        <EmptyState title="No applications to show" description="Your submitted applications will appear here with their current statuses." />
      )}
    </AppShell>
  );
}
