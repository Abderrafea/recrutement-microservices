export type Role = 'CANDIDATE' | 'EMPLOYER' | 'ADMIN';

export interface CandidateProfile {
  phone?: string;
  address?: string;
  summary?: string;
  cvUrl?: string;
  skills: string[];
}

export interface EmployerProfile {
  companyName?: string;
  companyDescription?: string;
  website?: string;
  industry?: string;
}

export interface UserSummary {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  createdAt?: string;
}

export interface UserProfile extends UserSummary {
  profile?: CandidateProfile | EmployerProfile | null;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  role: Role;
  user: UserSummary;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  phone?: string;
  address?: string;
  summary?: string;
  skills?: string[];
  companyName?: string;
  companyDescription?: string;
  website?: string;
  industry?: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  summary?: string;
  skills?: string[];
  companyName?: string;
  companyDescription?: string;
  website?: string;
  industry?: string;
}
