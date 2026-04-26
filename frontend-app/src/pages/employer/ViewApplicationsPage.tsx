import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { downloadApplicationCv, downloadApplicationCoverLetter, updateApplicationStatus } from '../../api/applications.api';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { AppShell } from '../../components/layout/AppShell';
import { useJobApplications } from '../../hooks/useApplications';
import { StatusBadge } from '../../components/applications/StatusBadge';
import { formatDate } from '../../utils/formatDate';
import { Panel } from '../../components/common/Panel';
import type { Application } from '../../types/application.types';

type AppStatus = 'REVIEWED' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED';

const statusConfig: Record<AppStatus, { label: string; icon: JSX.Element; colorClass: string }> = {
  REVIEWED: {
    label: 'Examiner',
    colorClass: 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
  },
  INTERVIEW: {
    label: 'Entretien',
    colorClass: 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
  },
  ACCEPTED: {
    label: 'Accepter',
    colorClass: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  REJECTED: {
    label: 'Refuser',
    colorClass: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
};

export function ViewApplicationsPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const applicationsQuery = useJobApplications(Number(id));
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [downloadingCoverId, setDownloadingCoverId] = useState<number | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [hiddenIds, setHiddenIds] = useState<Set<number>>(new Set());
  const [showRejected, setShowRejected] = useState(false);

  const updateMutation = useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: number; status: AppStatus }) =>
      updateApplicationStatus(applicationId, { status }),
    onSuccess: (_, variables) => {
      const { applicationId, status } = variables;
      toast.success(`Statut mis à jour : ${statusConfig[status].label}`);
      void queryClient.invalidateQueries({ queryKey: ['applications', 'job', Number(id)] });

      // Brief row highlight only
      setHighlightedId(applicationId);
      setTimeout(() => setHighlightedId(null), 1000);

      // Hide rejected after short animation
      if (status === 'REJECTED') {
        setTimeout(() => setHiddenIds((prev) => new Set([...prev, applicationId])), 600);
      }
    },
    onError: () => toast.error('Impossible de mettre à jour le statut.'),
  });

  async function handleDownloadCv(application: Application) {
    if (!application.cvFileName) { toast.error('Aucun CV joint.'); return; }
    try {
      setDownloadingId(application.id);
      await downloadApplicationCv(application.id, application.cvFileName);
    } catch { toast.error('Impossible de télécharger le CV.'); }
    finally { setDownloadingId(null); }
  }

  async function handleDownloadCoverLetter(application: Application) {
    if (!application.coverLetterFileName) { toast.error('Aucune lettre de motivation jointe.'); return; }
    try {
      setDownloadingCoverId(application.id);
      await downloadApplicationCoverLetter(application.id, application.coverLetterFileName);
    } catch { toast.error('Impossible de télécharger la lettre de motivation.'); }
    finally { setDownloadingCoverId(null); }
  }

  const applications = applicationsQuery.data ?? [];
  const visibleApplications = applications.filter((app) => {
    if (hiddenIds.has(app.id)) return false;
    if (!showRejected && app.status === 'REJECTED') return false;
    return true;
  });
  const rejectedCount = applications.filter((a) => a.status === 'REJECTED').length;

  return (
    <AppShell eyebrow="Centre de commande employeur" title="Examiner les candidatures reçues">
      {applicationsQuery.isLoading ? (
        <Spinner />
      ) : (
        <>
          {/* Toggle REJECTED */}
          {rejectedCount > 0 && (
            <div className="flex justify-end mb-3">
              <button
                type="button"
                onClick={() => setShowRejected((v) => !v)}
                className="text-xs font-semibold text-ink/50 hover:text-ink/80 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-ink/10 bg-white/60"
              >
                {showRejected ? 'Masquer les refusées' : `Afficher les refusées (${rejectedCount})`}
              </button>
            </div>
          )}

          <Panel className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-ink/10 text-ink/50">
                    <th className="px-4 py-3 font-medium">Candidat</th>
                    <th className="px-4 py-3 font-medium">Offre</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Statut</th>
                    <th className="px-4 py-3 font-medium">Changer le statut</th>
                    <th className="px-4 py-3 font-medium">Documents</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleApplications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-ink/40 text-sm">
                        Aucune candidature à afficher.
                      </td>
                    </tr>
                  ) : visibleApplications.map((application) => {
                    const isHighlighted = highlightedId === application.id;
                    return (
                      <tr
                        key={application.id}
                        className={[
                          'border-b border-ink/5 last:border-b-0 align-top transition-colors duration-700',
                          isHighlighted ? 'bg-coral/8' : 'bg-transparent',
                        ].join(' ')}
                      >
                        {/* Candidate */}
                        <td className="px-4 py-4">
                          <div className="font-semibold text-ink">{application.candidateName ?? 'Candidat'}</div>
                          <div className="text-xs text-ink/55">{application.candidateEmail}</div>
                        </td>
                        {/* Job */}
                        <td className="px-4 py-4">
                          <div className="font-semibold text-ink">{application.jobTitle ?? `Offre #${application.jobId}`}</div>
                          <div className="text-xs text-ink/55">{application.company}</div>
                        </td>
                        {/* Date */}
                        <td className="px-4 py-4 text-xs text-ink/60 whitespace-nowrap">
                          {formatDate(application.appliedAt)}
                        </td>
                        {/* Status */}
                        <td className="px-4 py-4">
                          <StatusBadge status={application.status} />
                        </td>
                        {/* Status change actions */}
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {(['REVIEWED', 'INTERVIEW', 'ACCEPTED', 'REJECTED'] as const).map((status) => {
                              const cfg = statusConfig[status];
                              const isActive = application.status === status;
                              return (
                                <button
                                  key={status}
                                  type="button"
                                  disabled={isActive || updateMutation.isPending}
                                  onClick={() => updateMutation.mutate({ applicationId: application.id, status })}
                                  title={cfg.label}
                                  className={[
                                    'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all duration-150',
                                    isActive
                                      ? 'opacity-40 cursor-default ' + cfg.colorClass
                                      : cfg.colorClass + ' hover:scale-105 active:scale-95',
                                  ].join(' ')}
                                >
                                  {cfg.icon}
                                  {cfg.label}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        {/* Documents download */}
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1.5">
                            {application.cvFileName && (
                              <button
                                type="button"
                                disabled={downloadingId === application.id}
                                onClick={() => void handleDownloadCv(application)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-ink/10 bg-white/70 px-2.5 py-1.5 text-xs font-semibold text-ink/70 hover:bg-white hover:text-ink transition-all duration-150 hover:scale-105 active:scale-95"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                                {downloadingId === application.id ? 'Chargement...' : 'CV'}
                              </button>
                            )}
                            {application.coverLetterFileName && (
                              <button
                                type="button"
                                disabled={downloadingCoverId === application.id}
                                onClick={() => void handleDownloadCoverLetter(application)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-ink/10 bg-white/70 px-2.5 py-1.5 text-xs font-semibold text-ink/70 hover:bg-white hover:text-ink transition-all duration-150 hover:scale-105 active:scale-95"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                </svg>
                                {downloadingCoverId === application.id ? 'Chargement...' : 'Lettre'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}
    </AppShell>
  );
}
