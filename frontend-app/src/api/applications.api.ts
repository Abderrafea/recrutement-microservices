import api from './axiosInstance';
import type { Application, ApplyPayload, StatusUpdatePayload } from '../types/application.types';

export async function applyToJob(payload: ApplyPayload) {
  const formData = new FormData();
  formData.append('jobId', String(payload.jobId));
  formData.append('coverLetter', payload.coverLetter);
  formData.append('cvFile', payload.cvFile);

  const { data } = await api.post<Application>('/api/applications', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
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

export async function downloadApplicationCv(applicationId: number, fallbackFileName: string) {
  const response = await api.get<Blob>(`/api/applications/${applicationId}/cv`, {
    responseType: 'blob',
  });

  const dispositionHeader = response.headers['content-disposition'];
  const matchedFileName = dispositionHeader?.match(/filename="?(?<name>[^"]+)"?/);
  const fileName = matchedFileName?.groups?.name ?? fallbackFileName;

  const objectUrl = window.URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
}
