import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { updateApplicationStatus } from '../../api/applications.api';
import { ApplicationTable } from '../../components/applications/ApplicationTable';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { AppShell } from '../../components/layout/AppShell';
import { useJobApplications } from '../../hooks/useApplications';

const statusLabels: Record<string, string> = {
  REVIEWED: 'Examiner',
  INTERVIEW: 'Entretien',
  ACCEPTED: 'Accepter',
  REJECTED: 'Refuser',
};

export function ViewApplicationsPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const applicationsQuery = useJobApplications(Number(id));
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

  const updateMutation = useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: number; status: 'REVIEWED' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED' }) =>
      updateApplicationStatus(applicationId, { status }),
    onSuccess: () => {
      toast.success('Statut de la candidature mis à jour.');
      void queryClient.invalidateQueries({ queryKey: ['applications', 'job', Number(id)] });
    },
  });

  return (
    <AppShell eyebrow="Centre de commande employeur" title="Examiner les candidatures reçues">
      {applicationsQuery.isLoading ? (
        <Spinner />
      ) : (
        <ApplicationTable
          applications={applicationsQuery.data ?? []}
          renderActions={(application) => (
            <div className="flex flex-wrap gap-2">
              {(['REVIEWED', 'INTERVIEW', 'ACCEPTED', 'REJECTED'] as const).map((status) => (
                <Button key={status} variant="ghost" onClick={() => updateMutation.mutate({ applicationId: application.id, status })}>
                  {statusLabels[status]}
                </Button>
              ))}
              <a
                href={`${apiBaseUrl}/api/users/${application.candidateId}/cv`}
                className="inline-flex items-center justify-center rounded-full border border-ink/15 px-4 py-3 text-xs font-semibold text-ink"
              >
                Télécharger le CV
              </a>
            </div>
          )}
        />
      )}
    </AppShell>
  );
}
