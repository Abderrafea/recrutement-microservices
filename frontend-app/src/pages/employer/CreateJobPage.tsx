import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../../api/jobs.api';
import { JobForm } from '../../components/jobs/JobForm';
import { AppShell } from '../../components/layout/AppShell';

export function CreateJobPage() {
  const navigate = useNavigate();
  const createMutation = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      toast.success('Offre publiée.');
      navigate('/employer/jobs');
    },
    onError: () => toast.error('Impossible de créer l\'offre.'),
  });

  return (
    <AppShell eyebrow="Centre de commande employeur" title="Créer une nouvelle offre">
      <JobForm isSubmitting={createMutation.isPending} onSubmit={(payload) => createMutation.mutate(payload)} />
    </AppShell>
  );
}
