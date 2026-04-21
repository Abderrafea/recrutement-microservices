import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { SelectField } from '../common/SelectField';
import { TextArea } from '../common/TextArea';
import { Panel } from '../common/Panel';
import type { JobFormPayload, JobOffer } from '../../types/job.types';

const jobSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(20),
  location: z.string().min(2),
  contractType: z.enum(['CDI', 'CDD', 'INTERNSHIP', 'FREELANCE', 'PART_TIME']),
  salary: z.string().optional(),
  experienceLevel: z.enum(['JUNIOR', 'MID', 'SENIOR', 'LEAD']),
  requiredSkills: z.string().min(2),
  expiresAt: z.string().optional(),
});

type JobFormValues = z.infer<typeof jobSchema>;

export function JobForm({
  defaultValues,
  isSubmitting,
  onSubmit,
}: {
  defaultValues?: Partial<JobOffer>;
  isSubmitting?: boolean;
  onSubmit: (payload: JobFormPayload) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      location: defaultValues?.location ?? '',
      contractType: defaultValues?.contractType ?? 'CDI',
      salary: defaultValues?.salary ?? '',
      experienceLevel: defaultValues?.experienceLevel ?? 'MID',
      requiredSkills: defaultValues?.requiredSkills?.join(', ') ?? '',
      expiresAt: defaultValues?.expiresAt?.slice(0, 16) ?? '',
    },
  });

  return (
    <Panel>
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={handleSubmit((values) =>
          onSubmit({
            ...values,
            salary: values.salary || undefined,
            expiresAt: values.expiresAt || undefined,
            requiredSkills: values.requiredSkills.split(',').map((skill) => skill.trim()).filter(Boolean),
          }),
        )}
      >
        <Input label="Job title" error={errors.title?.message} {...register('title')} />
        <Input label="Location" error={errors.location?.message} {...register('location')} />
        <SelectField
          label="Contract type"
          error={errors.contractType?.message}
          options={[
            { label: 'Permanent (CDI)', value: 'CDI' },
            { label: 'Fixed-term (CDD)', value: 'CDD' },
            { label: 'Internship', value: 'INTERNSHIP' },
            { label: 'Freelance', value: 'FREELANCE' },
            { label: 'Part time', value: 'PART_TIME' },
          ]}
          {...register('contractType')}
        />
        <SelectField
          label="Experience"
          error={errors.experienceLevel?.message}
          options={[
            { label: 'Junior', value: 'JUNIOR' },
            { label: 'Mid', value: 'MID' },
            { label: 'Senior', value: 'SENIOR' },
            { label: 'Lead', value: 'LEAD' },
          ]}
          {...register('experienceLevel')}
        />
        <Input label="Salary" error={errors.salary?.message} {...register('salary')} />
        <Input label="Expiry date" error={errors.expiresAt?.message} type="datetime-local" {...register('expiresAt')} />
        <div className="md:col-span-2">
          <Input label="Required skills" error={errors.requiredSkills?.message} placeholder="React, TypeScript, Spring Boot" {...register('requiredSkills')} />
        </div>
        <div className="md:col-span-2">
          <TextArea label="Description" error={errors.description?.message} {...register('description')} />
        </div>
        <div className="md:col-span-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save job'}
          </Button>
        </div>
      </form>
    </Panel>
  );
}
