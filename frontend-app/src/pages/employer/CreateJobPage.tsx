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
      toast.success('Job posted.');
      navigate('/employer/jobs');
    },
    onError: () => toast.error('Unable to create the job.'),
  });

  return (
    <AppShell eyebrow="Employer command center" title="Create a new role">
      <JobForm isSubmitting={createMutation.isPending} onSubmit={(payload) => createMutation.mutate(payload)} />
    </AppShell>
  );
}
