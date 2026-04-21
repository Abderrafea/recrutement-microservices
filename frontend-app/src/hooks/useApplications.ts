import { useQuery } from '@tanstack/react-query';
import { getCandidateApplications, getJobApplications } from '../api/applications.api';

export function useCandidateApplications(candidateId?: number) {
  return useQuery({
    queryKey: ['applications', 'candidate', candidateId],
    queryFn: () => getCandidateApplications(candidateId!),
    enabled: Boolean(candidateId),
  });
}

export function useJobApplications(jobId?: number) {
  return useQuery({
    queryKey: ['applications', 'job', jobId],
    queryFn: () => getJobApplications(jobId!),
    enabled: Boolean(jobId),
  });
}
