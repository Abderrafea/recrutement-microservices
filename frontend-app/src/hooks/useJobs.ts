import { useQuery } from '@tanstack/react-query';
import { getJob, getJobs } from '../api/jobs.api';
import type { JobSearchParams } from '../types/job.types';

export function useJobs(params: JobSearchParams) {
  return useQuery({
    queryKey: ['jobs', params],
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
