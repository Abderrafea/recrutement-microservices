import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { changeJobStatus, deleteJob, getEmployerJobs } from '../../api/jobs.api';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Panel } from '../../components/common/Panel';
import { AppShell } from '../../components/layout/AppShell';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatDate';

export function ManageJobsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const jobsQuery = useQuery({
    queryKey: ['jobs', 'employer', user?.id],
    queryFn: () => getEmployerJobs(user!.id),
    enabled: Boolean(user?.id),
  });

  const refreshJobs = () => queryClient.invalidateQueries({ queryKey: ['jobs', 'employer', user?.id] });

  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      toast.success('Offre supprimée.');
      void refreshJobs();
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'OPEN' | 'CLOSED' | 'PAUSED' }) => changeJobStatus(id, status),
    onSuccess: () => {
      toast.success('Statut de l\'offre mis à jour.');
      void refreshJobs();
    },
  });

  return (
    <AppShell
      eyebrow="Centre de commande employeur"
      title="Gérez vos offres d'emploi"
      actions={<Link to="/employer/jobs/new"><Button>Publier une offre</Button></Link>}
    >
      {jobsQuery.data?.length ? (
        <Panel className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-ink/45">
                <th className="px-4 py-3">Titre</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Candidatures</th>
                <th className="px-4 py-3">Publié le</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobsQuery.data.map((job) => (
                <tr key={job.id} className="border-b border-ink/5 last:border-b-0">
                  <td className="px-4 py-4 font-semibold">{job.title}</td>
                  <td className="px-4 py-4">{job.status}</td>
                  <td className="px-4 py-4">{job.applicationCount}</td>
                  <td className="px-4 py-4 text-xs text-ink/55">{formatDate(job.publishedAt)}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/employer/jobs/${job.id}/edit`}><Button variant="ghost">Modifier</Button></Link>
                      <Link to={`/employer/jobs/${job.id}/applications`}><Button variant="secondary">Candidatures</Button></Link>
                      <Button variant="ghost" onClick={() => statusMutation.mutate({ id: job.id, status: job.status === 'OPEN' ? 'PAUSED' : 'OPEN' })}>
                        {job.status === 'OPEN' ? 'Suspendre' : 'Réouvrir'}
                      </Button>
                      <Button variant="danger" onClick={() => deleteMutation.mutate(job.id)}>Supprimer</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      ) : (
        <EmptyState title="Aucune offre publiée" description="Créez votre première offre et elle apparaîtra ici avec le nombre de candidatures en temps réel." />
      )}
    </AppShell>
  );
}
