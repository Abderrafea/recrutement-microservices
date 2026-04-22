import { MapPin, Sparkles, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { JobOffer } from '../../types/job.types';
import { formatDate } from '../../utils/formatDate';
import { formatSalary } from '../../utils/formatSalary';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Panel } from '../common/Panel';

export function JobCard({ job, compact }: { job: JobOffer; compact?: boolean }) {
  return (
    <Panel className="fade-rise flex h-full flex-col justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="bg-coral/12 text-coral">{job.contractType}</Badge>
          <Badge className="bg-lagoon/12 text-lagoon">{job.experienceLevel}</Badge>
        </div>
        <h3 className="mt-5 font-display text-2xl text-ink">{job.title}</h3>
        <p className="mt-2 text-sm font-semibold text-ink/65">{job.company}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-ink/65">
          <span className="inline-flex items-center gap-2"><MapPin size={14} /> {job.location}</span>
          <span className="inline-flex items-center gap-2"><Wallet size={14} /> {formatSalary(job.salary)}</span>
          <span className="inline-flex items-center gap-2"><Sparkles size={14} /> {formatDate(job.publishedAt)}</span>
        </div>
        {!compact && <p className="mt-5 text-sm leading-7 text-ink/75">{job.description.slice(0, 180)}...</p>}
      </div>
      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {job.requiredSkills.slice(0, compact ? 2 : 4).map((skill) => (
            <Badge key={skill}>{skill}</Badge>
          ))}
        </div>
        <Link
          to={`/jobs/${job.id}`}
          className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Voir
        </Link>
      </div>
    </Panel>
  );
}
