import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { updateJob } from '../../api/jobs.api';
import { JobForm } from '../../components/jobs/JobForm';
import { Spinner } from '../../components/common/Spinner';
import { AppShell } from '../../components/layout/AppShell';
import { useJob } from '../../hooks/useJobs';

export function EditJobPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const jobQuery = useJob(id);
  const updateMutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateJob>[1]) => updateJob(id!, payload),
    onSuccess: () => {
      toast.success('Offre mise à jour.');
      navigate('/employer/jobs');
    },
    onError: () => toast.error('Impossible de mettre à jour l\'offre.'),
  });

  return (
    <AppShell eyebrow="Centre de commande employeur" title="Modifier les détails du poste">
      {jobQuery.isLoading || !jobQuery.data ? (
        <Spinner />
      ) : (
        <JobForm defaultValues={jobQuery.data} isSubmitting={updateMutation.isPending} onSubmit={(payload) => updateMutation.mutate(payload)} />
      )}
    </AppShell>
  );
}
