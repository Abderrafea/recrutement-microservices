import api from './axiosInstance';
import type { Application, ApplyPayload, StatusUpdatePayload } from '../types/application.types';

export async function applyToJob(payload: ApplyPayload) {
  const { data } = await api.post<Application>('/api/applications', payload);
  return data;
}

export async function getApplication(applicationId: number | string) {
  const { data } = await api.get<Application>(`/api/applications/${applicationId}`);
  return data;
}

export async function getCandidateApplications(candidateId: number) {
  const { data } = await api.get<Application[]>(`/api/applications/candidate/${candidateId}`);
  return data;
}

export async function getJobApplications(jobId: number | string) {
  const { data } = await api.get<Application[]>(`/api/applications/job/${jobId}`);
  return data;
}

export async function updateApplicationStatus(applicationId: number, payload: StatusUpdatePayload) {
  const { data } = await api.patch<Application>(`/api/applications/${applicationId}/status`, payload);
  return data;
}

export async function withdrawApplication(applicationId: number) {
  await api.delete(`/api/applications/${applicationId}`);
}
