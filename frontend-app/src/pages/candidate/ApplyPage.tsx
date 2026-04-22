import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { applyToJob } from '../../api/applications.api';
import { Button } from '../../components/common/Button';
import { Panel } from '../../components/common/Panel';
import { TextArea } from '../../components/common/TextArea';
import { AppShell } from '../../components/layout/AppShell';
import { useJob } from '../../hooks/useJobs';

const applySchema = z.object({
  coverLetter: z.string().min(30),
});

type ApplyValues = z.infer<typeof applySchema>;

export function ApplyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const jobQuery = useJob(id);
  const form = useForm<ApplyValues>({
    resolver: zodResolver(applySchema),
  });

  const applyMutation = useMutation({
    mutationFn: (values: ApplyValues) => applyToJob({ jobId: Number(id), coverLetter: values.coverLetter }),
    onSuccess: () => {
      toast.success('Candidature envoyée.');
      navigate('/candidate/applications');
    },
    onError: () => toast.error('Impossible de soumettre cette candidature.'),
  });

  return (
    <AppShell eyebrow="Centre de commande candidat" title={`Postuler pour ${jobQuery.data?.title ?? 'ce poste'}`}>
      <Panel>
        <form onSubmit={form.handleSubmit((values) => applyMutation.mutate(values))} className="space-y-4">
          <TextArea label="Lettre de motivation" error={form.formState.errors.coverLetter?.message} {...form.register('coverLetter')} />
          <Button type="submit" disabled={applyMutation.isPending}>{applyMutation.isPending ? 'Envoi en cours...' : 'Envoyer la candidature'}</Button>
        </form>
      </Panel>
    </AppShell>
  );
}
