import api from './axiosInstance';
import type { JobFormPayload, JobOffer, JobsPageResponse, JobSearchParams } from '../types/job.types';

export async function getJobs(params: JobSearchParams = {}) {
  const hasFilter = params.query || params.location || params.contractType || params.experienceLevel || params.status;
  const endpoint = hasFilter ? '/api/jobs/search' : '/api/jobs';
  const { data } = await api.get<JobsPageResponse>(endpoint, { params });
  return data;
}

export async function getJob(jobId: string | number) {
  const { data } = await api.get<JobOffer>(`/api/jobs/${jobId}`);
  return data;
}

export async function createJob(payload: JobFormPayload) {
  const { data } = await api.post<JobOffer>('/api/jobs', payload);
  return data;
}

export async function updateJob(jobId: string | number, payload: JobFormPayload) {
  const { data } = await api.put<JobOffer>(`/api/jobs/${jobId}`, payload);
  return data;
}

export async function getEmployerJobs(employerId: number) {
  const { data } = await api.get<JobOffer[]>(`/api/jobs/employer/${employerId}`);
  return data;
}

export async function changeJobStatus(jobId: number, status: JobOffer['status']) {
  const { data } = await api.patch<JobOffer>(`/api/jobs/${jobId}/status`, { status });
  return data;
}

export async function deleteJob(jobId: number) {
  await api.delete(`/api/jobs/${jobId}`);
}
