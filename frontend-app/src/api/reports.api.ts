import api from './axiosInstance';
import type {
  ApplicationStatisticsReport,
  EmployerReport,
  JobStatisticsReport,
  PlatformOverview,
} from '../types/report.types';

export async function getOverview() {
  const { data } = await api.get<PlatformOverview>('/api/reports/overview');
  return data;
}

export async function getJobsReport() {
  const { data } = await api.get<JobStatisticsReport>('/api/reports/jobs');
  return data;
}

export async function getApplicationsReport() {
  const { data } = await api.get<ApplicationStatisticsReport>('/api/reports/applications');
  return data;
}

export async function getEmployerReport(employerId: number) {
  const { data } = await api.get<EmployerReport>(`/api/reports/employer/${employerId}`);
  return data;
}
