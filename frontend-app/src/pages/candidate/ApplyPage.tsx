import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { applyToJob } from '../../api/applications.api';
import { FileUploadZone } from '../../components/common/FileUploadZone';
import { Button } from '../../components/common/Button';
import { Panel } from '../../components/common/Panel';
import { Spinner } from '../../components/common/Spinner';
import { AppShell } from '../../components/layout/AppShell';
import { useCandidateApplications } from '../../hooks/useApplications';
import { useAuth } from '../../hooks/useAuth';
import { useJob } from '../../hooks/useJobs';

const cvIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

const coverLetterIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
  </svg>
);

export function ApplyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const jobQuery = useJob(id);
  const candidateApplicationsQuery = useCandidateApplications(user?.role === 'CANDIDATE' ? user.id : undefined);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);
  const [coverLetterError, setCoverLetterError] = useState<string | null>(null);
  const hasRedirected = useRef(false);

  const hasAlreadyApplied = candidateApplicationsQuery.data?.some((application) => application.jobId === Number(id)) ?? false;

  useEffect(() => {
    if (hasAlreadyApplied && !hasRedirected.current) {
      hasRedirected.current = true;
      toast.error('Vous avez déjà postulé à cette offre.');
      navigate('/candidate/applications', { replace: true });
    }
  }, [hasAlreadyApplied, navigate]);

  const applyMutation = useMutation({
    mutationFn: () => {
      if (!cvFile) throw new Error('missing_cv');
      if (!coverLetterFile) throw new Error('missing_cover_letter');
      return applyToJob({ jobId: Number(id), coverLetterFile, cvFile });
    },
    onSuccess: () => {
      toast.success('Candidature envoyée avec succès !');
      navigate('/candidate/applications');
    },
    onError: (error) => {
      if (error instanceof Error && error.message === 'missing_cv') {
        setCvError('Le CV est obligatoire.');
        return;
      }
      if (error instanceof Error && error.message === 'missing_cover_letter') {
        setCoverLetterError('La lettre de motivation est obligatoire.');
        return;
      }
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        toast.error('Vous avez déjà postulé à cette offre.');
        return;
      }
      toast.error('Impossible de soumettre cette candidature.');
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let hasError = false;

    if (!cvFile) { setCvError('Le CV est obligatoire.'); hasError = true; }
    else { setCvError(null); }

    if (!coverLetterFile) { setCoverLetterError('La lettre de motivation est obligatoire.'); hasError = true; }
    else { setCoverLetterError(null); }

    if (!hasError) applyMutation.mutate();
  }

  if (jobQuery.isLoading || candidateApplicationsQuery.isLoading) {
    return (
      <AppShell eyebrow="Centre de commande candidat" title={`Postuler pour ${jobQuery.data?.title ?? 'ce poste'}`}>
        <Spinner />
      </AppShell>
    );
  }

  if (hasAlreadyApplied) {
    return (
      <AppShell eyebrow="Centre de commande candidat" title={`Postuler pour ${jobQuery.data?.title ?? 'ce poste'}`}>
        <Panel>Redirection vers vos candidatures...</Panel>
      </AppShell>
    );
  }

  const job = jobQuery.data;

  return (
    <AppShell eyebrow="Centre de commande candidat" title={`Postuler pour ${job?.title ?? 'ce poste'}`}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Job summary card */}
        {job && (
          <Panel className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-coral/10 text-coral">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-ink leading-tight">{job.title}</p>
              <p className="text-sm text-ink/55 mt-0.5">{job.location} · {job.contractType}</p>
            </div>
          </Panel>
        )}

        {/* Upload form */}
        <Panel>
          <h2 className="text-lg font-bold text-ink mb-1">Vos documents</h2>
          <p className="text-sm text-ink/50 mb-6">Soumettez votre CV et votre lettre de motivation au format PDF, DOC ou DOCX.</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FileUploadZone
              label="Curriculum Vitae (CV)"
              accept=".pdf,.doc,.docx"
              value={cvFile}
              error={cvError ?? undefined}
              onChange={(file) => { setCvFile(file); setCvError(null); }}
              icon={cvIcon}
            />

            <FileUploadZone
              label="Lettre de motivation"
              accept=".pdf,.doc,.docx"
              value={coverLetterFile}
              error={coverLetterError ?? undefined}
              onChange={(file) => { setCoverLetterFile(file); setCoverLetterError(null); }}
              icon={coverLetterIcon}
            />

            <Button
              type="submit"
              disabled={applyMutation.isPending}
              fullWidth
            >
              {applyMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Envoi en cours...
                </span>
              ) : 'Envoyer la candidature'}
            </Button>
          </form>
        </Panel>
      </div>
    </AppShell>
  );
}
