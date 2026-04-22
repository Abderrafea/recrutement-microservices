import type { Application } from '../../types/application.types';
import { Badge } from '../common/Badge';

const styles: Record<Application['status'], string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  REVIEWED: 'bg-sky-100 text-sky-700',
  INTERVIEW: 'bg-violet-100 text-violet-700',
  ACCEPTED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-rose-100 text-rose-700',
};

const labels: Record<Application['status'], string> = {
  PENDING: 'En attente',
  REVIEWED: 'Examinée',
  INTERVIEW: 'Entretien',
  ACCEPTED: 'Acceptée',
  REJECTED: 'Refusée',
};

export function StatusBadge({ status }: { status: Application['status'] }) {
  return <Badge className={styles[status]}>{labels[status]}</Badge>;
}
