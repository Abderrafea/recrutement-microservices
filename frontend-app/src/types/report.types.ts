export interface PlatformOverview {
  totalUsers: number;
  totalCandidates: number;
  totalEmployers: number;
  totalJobOffers: number;
  openJobOffers: number;
  totalApplications: number;
  applicationsByStatus: Record<string, number>;
  topLocations: string[];
  registrationsByDate: Record<string, number>;
  acceptanceRate: number;
  generatedAt: string;
}

export interface EmployerPerformance {
  employerId: number;
  companyName: string;
  totalJobsPosted: number;
  applicationsReceived: number;
}

export interface JobStatisticsReport {
  totalJobs: number;
  openJobs: number;
  jobsByLocation: Record<string, number>;
  jobsByContractType: Record<string, number>;
  topEmployers: EmployerPerformance[];
  generatedAt: string;
}

export interface ApplicationStatisticsReport {
  totalApplications: number;
  applicationsByStatus: Record<string, number>;
  applicationsByJob: Record<string, number>;
  acceptanceRate: number;
  generatedAt: string;
}

export interface JobPerformance {
  jobId: number;
  title: string;
  applications: number;
  status: string;
}

export interface EmployerReport {
  employerId: number;
  companyName: string;
  totalJobsPosted: number;
  openJobs: number;
  totalApplicationsReceived: number;
  acceptanceRate: number;
  averageApplicationsPerJob: number;
  jobPerformance: JobPerformance[];
  generatedAt: string;
}
