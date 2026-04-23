export interface Application {
  id: number;
  candidateId: number;
  candidateName?: string;
  candidateEmail?: string;
  candidateCvUrl?: string;
  cvFileName?: string;
  jobId: number;
  jobTitle?: string;
  company?: string;
  coverLetter: string;
  status: 'PENDING' | 'REVIEWED' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED';
  appliedAt: string;
  updatedAt: string;
  employerNote?: string;
}

export interface ApplyPayload {
  jobId: number;
  coverLetter: string;
  cvFile: File;
}

export interface StatusUpdatePayload {
  status: Application['status'];
  employerNote?: string;
}
