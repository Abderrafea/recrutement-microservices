import type { ReactNode } from 'react';
import type { Application } from '../../types/application.types';
import { formatDate } from '../../utils/formatDate';
import { Panel } from '../common/Panel';
import { StatusBadge } from './StatusBadge';

export function ApplicationTable({
  applications,
  renderActions,
}: {
  applications: Application[];
  renderActions?: (application: Application) => ReactNode;
}) {
  return (
    <Panel className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-ink/50">
              <th className="px-4 py-3 font-medium">Offre</th>
              <th className="px-4 py-3 font-medium">Candidat</th>
              <th className="px-4 py-3 font-medium">Postulé le</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr key={application.id} className="border-b border-ink/5 text-ink/80 last:border-b-0">
                <td className="px-4 py-4">
                  <div className="font-semibold">{application.jobTitle ?? `Offre #${application.jobId}`}</div>
                  <div className="text-xs text-ink/55">{application.company}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="font-semibold">{application.candidateName ?? 'Vue candidat'}</div>
                  <div className="text-xs text-ink/55">{application.candidateEmail}</div>
                </td>
                <td className="px-4 py-4 text-xs text-ink/60">{formatDate(application.appliedAt)}</td>
                <td className="px-4 py-4"><StatusBadge status={application.status} /></td>
                <td className="px-4 py-4">{renderActions?.(application)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
