import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Spinner } from '../../components/common/Spinner';
import { StatusBadge } from '../../components/applications/StatusBadge';
import { Panel } from '../../components/common/Panel';
import { withdrawApplication } from '../../api/applications.api';
import { useCandidateApplications } from '../../hooks/useApplications';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatDate';
import type { Application } from '../../types/application.types';

const statusMessages: Record<Application['status'], { label: string; emoji: string; colorClass: string }> = {
  PENDING: { label: 'En attente de réponse', emoji: '⏳', colorClass: 'bg-amber-50 border-amber-200' },
  REVIEWED: { label: 'Votre candidature a été examinée', emoji: '👀', colorClass: 'bg-sky-50 border-sky-200' },
  INTERVIEW: { label: "Félicitations ! Vous êtes convié à un entretien", emoji: '🎉', colorClass: 'bg-violet-50 border-violet-200' },
  ACCEPTED: { label: 'Félicitations ! Votre candidature est acceptée', emoji: '✅', colorClass: 'bg-emerald-50 border-emerald-200' },
  REJECTED: { label: 'Votre candidature n\'a pas été retenue', emoji: '😔', colorClass: 'bg-rose-50 border-rose-200' },
};

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

  const applications = applicationsQuery.data ?? [];

  return (
    <AppShell eyebrow="Centre de commande candidat" title="Votre pipeline de candidatures">
      {applicationsQuery.isLoading ? (
        <Spinner />
      ) : applications.length === 0 ? (
        <EmptyState
          title="Aucune candidature à afficher"
          description="Vos candidatures soumises apparaîtront ici avec leur statut actuel."
        />
      ) : (
        <div className="space-y-4">
          {applications.map((application) => {
            const msg = statusMessages[application.status];
            return (
              <Panel
                key={application.id}
                className={[
                  'transition-all duration-300 border',
                  application.status === 'ACCEPTED' ? 'border-emerald-300 shadow-emerald-100' :
                  application.status === 'INTERVIEW' ? 'border-violet-300 shadow-violet-100' :
                  application.status === 'REJECTED' ? 'border-rose-200 opacity-60' :
                  'border-transparent',
                ].join(' ')}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {/* Job info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-ink text-base leading-tight">
                        {application.jobTitle ?? `Offre #${application.jobId}`}
                      </h3>
                      <StatusBadge status={application.status} />
                    </div>
                    {application.company && (
                      <p className="mt-0.5 text-sm text-ink/55">{application.company}</p>
                    )}
                    <p className="mt-1 text-xs text-ink/40">Postulé le {formatDate(application.appliedAt)}</p>

                    {/* Status message banner */}
                    <div className={`mt-3 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${msg.colorClass}`}>
                      <span>{msg.emoji}</span>
                      <span>{msg.label}</span>
                    </div>

                    {/* Interview highlight */}
                    {application.status === 'INTERVIEW' && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-violet-700 font-semibold animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                        </svg>
                        Consultez votre email pour les détails de l&apos;entretien
                      </div>
                    )}

                    {/* Employer note */}
                    {application.employerNote && (
                      <div className="mt-3 rounded-xl bg-ink/5 px-3 py-2 text-xs text-ink/65 italic">
                        Note de l&apos;employeur : {application.employerNote}
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <div className="shrink-0">
                    {application.status === 'PENDING' && (
                      <Button
                        variant="danger"
                        onClick={() => withdrawMutation.mutate(application.id)}
                        disabled={withdrawMutation.isPending}
                      >
                        Retirer
                      </Button>
                    )}
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
