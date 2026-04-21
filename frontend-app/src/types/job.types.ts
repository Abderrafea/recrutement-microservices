export interface JobOffer {
  id: number;
  title: string;
  description: string;
  company: string;
  location: string;
  contractType: 'CDI' | 'CDD' | 'INTERNSHIP' | 'FREELANCE' | 'PART_TIME';
  salary?: string;
  experienceLevel: 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD';
  requiredSkills: string[];
  status: 'OPEN' | 'CLOSED' | 'PAUSED';
  employerId: number;
  publishedAt: string;
  expiresAt?: string;
  applicationCount: number;
}

export interface JobSearchParams {
  query?: string;
  location?: string;
  contractType?: string;
  experienceLevel?: string;
  status?: string;
  page?: number;
  size?: number;
  sortBy?: string;
}

export interface JobFormPayload {
  title: string;
  description: string;
  location: string;
  contractType: JobOffer['contractType'];
  salary?: string;
  experienceLevel: JobOffer['experienceLevel'];
  requiredSkills: string[];
  expiresAt?: string;
}

export interface JobsPageResponse {
  content: JobOffer[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
