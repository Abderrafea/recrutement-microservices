import type { Dispatch, SetStateAction } from 'react';
import type { JobSearchParams } from '../../types/job.types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Panel } from '../common/Panel';
import { SelectField } from '../common/SelectField';

export function JobFilters({
  filters,
  setFilters,
}: {
  filters: JobSearchParams;
  setFilters: Dispatch<SetStateAction<JobSearchParams>>;
}) {
  return (
    <Panel className="space-y-4">
      <h3 className="font-display text-2xl text-ink">Affiner la recherche</h3>
      <Input
        label="Localisation"
        value={filters.location ?? ''}
        onChange={(event) => setFilters((current) => ({ ...current, location: event.target.value, page: 0 }))}
      />
      <SelectField
        label="Type de contrat"
        value={filters.contractType ?? ''}
        onChange={(event) => setFilters((current) => ({ ...current, contractType: event.target.value || undefined, page: 0 }))}
        options={[
          { label: 'Tous les contrats', value: '' },
          { label: 'CDI', value: 'CDI' },
          { label: 'CDD', value: 'CDD' },
          { label: 'Stage', value: 'INTERNSHIP' },
          { label: 'Freelance', value: 'FREELANCE' },
          { label: 'Temps partiel', value: 'PART_TIME' },
        ]}
      />
      <SelectField
        label="Expérience"
        value={filters.experienceLevel ?? ''}
        onChange={(event) => setFilters((current) => ({ ...current, experienceLevel: event.target.value || undefined, page: 0 }))}
        options={[
          { label: 'Tous niveaux', value: '' },
          { label: 'Junior', value: 'JUNIOR' },
          { label: 'Intermédiaire', value: 'MID' },
          { label: 'Senior', value: 'SENIOR' },
          { label: 'Lead', value: 'LEAD' },
        ]}
      />
      <Button variant="ghost" fullWidth onClick={() => setFilters({ page: 0, size: 9 })}>
        Réinitialiser les filtres
      </Button>
    </Panel>
  );
}
