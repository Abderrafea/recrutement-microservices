import { useState, type ReactNode } from 'react';
import type { Application } from '../../types/application.types';
import { formatDate } from '../../utils/formatDate';
import { Panel } from '../common/Panel';
import { StatusBadge } from './StatusBadge';

export function ApplicationTable({
  applications,
  renderActions,
  showCoverLetter = false,
}: {
  applications: Application[];
  renderActions?: (application: Application) => ReactNode;
  showCoverLetter?: boolean;
}) {
  const [expandedLetters, setExpandedLetters] = useState<Record<number, boolean>>({});

  function toggleCoverLetter(applicationId: number) {
    setExpandedLetters((current) => ({
      ...current,
      [applicationId]: !current[applicationId],
    }));
  }

  return (
    <Panel className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-ink/50">
              <th className="px-4 py-3 font-medium">Offre</th>
              <th className="px-4 py-3 font-medium">Candidat</th>
              <th className="px-4 py-3 font-medium">Postule le</th>
              {showCoverLetter && <th className="px-4 py-3 font-medium">Lettre de motivation</th>}
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => {
              const isExpanded = expandedLetters[application.id] ?? false;
              const shortCoverLetter =
                application.coverLetter.length > 140
                  ? `${application.coverLetter.slice(0, 140)}...`
                  : application.coverLetter;

              return (
                <tr key={application.id} className="border-b border-ink/5 text-ink/80 last:border-b-0 align-top">
                  <td className="px-4 py-4">
                    <div className="font-semibold">{application.jobTitle ?? `Offre #${application.jobId}`}</div>
                    <div className="text-xs text-ink/55">{application.company}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-semibold">{application.candidateName ?? 'Vue candidat'}</div>
                    <div className="text-xs text-ink/55">{application.candidateEmail}</div>
                  </td>
                  <td className="px-4 py-4 text-xs text-ink/60">{formatDate(application.appliedAt)}</td>
                  {showCoverLetter && (
                    <td className="px-4 py-4 text-sm text-ink/75">
                      <p className="max-w-md whitespace-pre-wrap">{isExpanded ? application.coverLetter : shortCoverLetter}</p>
                      {application.coverLetter.length > 140 && (
                        <button
                          type="button"
                          className="mt-2 text-xs font-semibold text-coral"
                          onClick={() => toggleCoverLetter(application.id)}
                        >
                          {isExpanded ? 'Reduire' : 'Voir plus'}
                        </button>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-4"><StatusBadge status={application.status} /></td>
                  <td className="px-4 py-4">{renderActions?.(application)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
