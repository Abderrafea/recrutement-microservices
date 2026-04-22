import { Link, useParams } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Panel } from '../../components/common/Panel';
import { Spinner } from '../../components/common/Spinner';
import { useJob } from '../../hooks/useJobs';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatDate';
import { formatSalary } from '../../utils/formatSalary';

export function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const jobQuery = useJob(id);

  if (jobQuery.isLoading) {
    return (
      <PageWrapper>
        <Spinner />
      </PageWrapper>
    );
  }

  const job = jobQuery.data;
  if (!job) {
    return (
      <PageWrapper>
        <Panel>Offre introuvable.</Panel>
      </PageWrapper>
    );
  }

  const applyPath = user?.role === 'CANDIDATE' ? `/jobs/${job.id}/apply` : '/login';

  return (
    <PageWrapper>
      <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
        <Panel className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <Badge className="bg-coral/12 text-coral">{job.contractType}</Badge>
            <Badge className="bg-lagoon/12 text-lagoon">{job.experienceLevel}</Badge>
            <Badge>{job.status}</Badge>
          </div>
          <div>
            <p className="text-sm text-ink/55">{job.company}</p>
            <h1 className="mt-2 font-display text-4xl text-ink">{job.title}</h1>
          </div>
          <p className="text-base leading-8 text-ink/75">{job.description}</p>
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills.map((skill) => (
              <Badge key={skill}>{skill}</Badge>
            ))}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <h3 className="font-display text-2xl text-ink">Aperçu du poste</h3>
            <dl className="mt-5 space-y-4 text-sm text-ink/70">
              <div>
                <dt className="text-xs uppercase tracking-[0.24em] text-ink/45">Localisation</dt>
                <dd className="mt-1">{job.location}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.24em] text-ink/45">Salaire</dt>
                <dd className="mt-1">{formatSalary(job.salary)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.24em] text-ink/45">Publié le</dt>
                <dd className="mt-1">{formatDate(job.publishedAt)}</dd>
              </div>
            </dl>
            <Link to={applyPath} className="mt-6 inline-flex">
              <Button fullWidth>{user?.role === 'CANDIDATE' ? 'Postuler maintenant' : 'Se connecter pour postuler'}</Button>
            </Link>
          </Panel>
        </div>
      </div>
    </PageWrapper>
  );
}
