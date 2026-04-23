import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { downloadApplicationCv, updateApplicationStatus } from '../../api/applications.api';
import { ApplicationTable } from '../../components/applications/ApplicationTable';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { AppShell } from '../../components/layout/AppShell';
import { useJobApplications } from '../../hooks/useApplications';
import type { Application } from '../../types/application.types';

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
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const updateMutation = useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: number; status: 'REVIEWED' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED' }) =>
      updateApplicationStatus(applicationId, { status }),
    onSuccess: () => {
      toast.success('Statut de la candidature mis a jour.');
      void queryClient.invalidateQueries({ queryKey: ['applications', 'job', Number(id)] });
    },
  });

  async function handleDownload(application: Application) {
    if (!application.cvFileName) {
      toast.error('Aucun CV joint a cette candidature.');
      return;
    }

    try {
      setDownloadingId(application.id);
      await downloadApplicationCv(application.id, application.cvFileName);
    } catch {
      toast.error('Impossible de telecharger ce CV.');
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <AppShell eyebrow="Centre de commande employeur" title="Examiner les candidatures recues">
      {applicationsQuery.isLoading ? (
        <Spinner />
      ) : (
        <ApplicationTable
          applications={applicationsQuery.data ?? []}
          showCoverLetter
          renderActions={(application) => (
            <div className="flex flex-wrap gap-2">
              {(['REVIEWED', 'INTERVIEW', 'ACCEPTED', 'REJECTED'] as const).map((status) => (
                <Button key={status} variant="ghost" onClick={() => updateMutation.mutate({ applicationId: application.id, status })}>
                  {statusLabels[status]}
                </Button>
              ))}
              {application.cvFileName && (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={downloadingId === application.id}
                  onClick={() => void handleDownload(application)}
                >
                  {downloadingId === application.id ? 'Telechargement...' : 'Telecharger le CV'}
                </Button>
              )}
            </div>
          )}
        />
      )}
    </AppShell>
  );
}
