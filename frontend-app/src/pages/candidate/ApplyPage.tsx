import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { applyToJob } from '../../api/applications.api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Panel } from '../../components/common/Panel';
import { Spinner } from '../../components/common/Spinner';
import { TextArea } from '../../components/common/TextArea';
import { AppShell } from '../../components/layout/AppShell';
import { useCandidateApplications } from '../../hooks/useApplications';
import { useAuth } from '../../hooks/useAuth';
import { useJob } from '../../hooks/useJobs';

const applySchema = z.object({
  coverLetter: z.string().min(30),
});

type ApplyValues = z.infer<typeof applySchema>;

export function ApplyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const jobQuery = useJob(id);
  const candidateApplicationsQuery = useCandidateApplications(user?.role === 'CANDIDATE' ? user.id : undefined);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);
  const hasRedirected = useRef(false);
  const form = useForm<ApplyValues>({
    resolver: zodResolver(applySchema),
  });
  const hasAlreadyApplied = candidateApplicationsQuery.data?.some((application) => application.jobId === Number(id)) ?? false;

  useEffect(() => {
    if (hasAlreadyApplied && !hasRedirected.current) {
      hasRedirected.current = true;
      toast.error('Vous avez deja postule a cette offre.');
      navigate('/candidate/applications', { replace: true });
    }
  }, [hasAlreadyApplied, navigate]);

  const applyMutation = useMutation({
    mutationFn: (values: ApplyValues) => {
      if (!cvFile) {
        throw new Error('missing_cv');
      }

      return applyToJob({ jobId: Number(id), coverLetter: values.coverLetter, cvFile });
    },
    onSuccess: () => {
      toast.success('Candidature envoyee.');
      navigate('/candidate/applications');
    },
    onError: (error) => {
      if (error instanceof Error && error.message === 'missing_cv') {
        setCvError('Le CV est obligatoire.');
        return;
      }
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        toast.error('Vous avez deja postule a cette offre.');
        return;
      }
      toast.error('Impossible de soumettre cette candidature.');
    },
  });

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

  return (
    <AppShell eyebrow="Centre de commande candidat" title={`Postuler pour ${jobQuery.data?.title ?? 'ce poste'}`}>
      <Panel>
        <form
          onSubmit={form.handleSubmit((values) => {
            if (!cvFile) {
              setCvError('Le CV est obligatoire.');
              return;
            }

            const normalizedName = cvFile.name.toLowerCase();
            if (!(normalizedName.endsWith('.pdf') || normalizedName.endsWith('.doc') || normalizedName.endsWith('.docx'))) {
              setCvError('Le CV doit etre au format PDF, DOC ou DOCX.');
              return;
            }

            setCvError(null);
            applyMutation.mutate(values);
          })}
          className="space-y-4"
        >
          <TextArea label="Lettre de motivation" error={form.formState.errors.coverLetter?.message} {...form.register('coverLetter')} />
          <Input
            label="CV"
            type="file"
            accept=".pdf,.doc,.docx"
            error={cvError ?? undefined}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setCvFile(file);
              setCvError(null);
            }}
          />
          <Button type="submit" disabled={applyMutation.isPending}>
            {applyMutation.isPending ? 'Envoi en cours...' : 'Envoyer la candidature'}
          </Button>
        </form>
      </Panel>
    </AppShell>
  );
}
