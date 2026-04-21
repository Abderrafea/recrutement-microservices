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
      <h3 className="font-display text-2xl text-ink">Refine the search</h3>
      <Input
        label="Location"
        value={filters.location ?? ''}
        onChange={(event) => setFilters((current) => ({ ...current, location: event.target.value, page: 0 }))}
      />
      <SelectField
        label="Contract type"
        value={filters.contractType ?? ''}
        onChange={(event) => setFilters((current) => ({ ...current, contractType: event.target.value || undefined, page: 0 }))}
        options={[
          { label: 'All contracts', value: '' },
          { label: 'CDI', value: 'CDI' },
          { label: 'CDD', value: 'CDD' },
          { label: 'Internship', value: 'INTERNSHIP' },
          { label: 'Freelance', value: 'FREELANCE' },
          { label: 'Part time', value: 'PART_TIME' },
        ]}
      />
      <SelectField
        label="Experience"
        value={filters.experienceLevel ?? ''}
        onChange={(event) => setFilters((current) => ({ ...current, experienceLevel: event.target.value || undefined, page: 0 }))}
        options={[
          { label: 'Any level', value: '' },
          { label: 'Junior', value: 'JUNIOR' },
          { label: 'Mid', value: 'MID' },
          { label: 'Senior', value: 'SENIOR' },
          { label: 'Lead', value: 'LEAD' },
        ]}
      />
      <Button variant="ghost" fullWidth onClick={() => setFilters({ page: 0, size: 9 })}>
        Reset filters
      </Button>
    </Panel>
  );
}
