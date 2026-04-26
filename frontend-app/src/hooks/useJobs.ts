import { useQuery } from '@tanstack/react-query';
import { getJob, getJobs } from '../api/jobs.api';
import type { JobSearchParams } from '../types/job.types';

export function useJobs(params: JobSearchParams) {
  // Spread params into the query key so React Query detects individual field changes
  return useQuery({
    queryKey: ['jobs', params.query, params.location, params.contractType, params.experienceLevel, params.status, params.page, params.size],
    queryFn: () => getJobs(params),
  });
}

export function useJob(jobId?: string) {
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJob(jobId!),
    enabled: Boolean(jobId),
  });
}
