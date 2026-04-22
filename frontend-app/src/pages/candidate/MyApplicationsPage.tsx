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
      toast.success('Candidature retirée.');
      void queryClient.invalidateQueries({ queryKey: ['applications', 'candidate', user?.id] });
    },
    onError: () => toast.error('Impossible de retirer la candidature.'),
  });

  return (
    <AppShell eyebrow="Centre de commande candidat" title="Votre pipeline de candidatures">
      {applicationsQuery.isLoading ? (
        <Spinner />
      ) : applicationsQuery.data?.length ? (
        <ApplicationTable
          applications={applicationsQuery.data}
          renderActions={(application) =>
            application.status === 'PENDING' ? (
              <Button variant="danger" onClick={() => withdrawMutation.mutate(application.id)}>
                Retirer
              </Button>
            ) : null
          }
        />
      ) : (
        <EmptyState title="Aucune candidature à afficher" description="Vos candidatures soumises apparaîtront ici avec leur statut actuel." />
      )}
    </AppShell>
  );
}
