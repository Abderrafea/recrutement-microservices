export interface Application {
  id: number;
  candidateId: number;
  candidateName?: string;
  candidateEmail?: string;
  candidateCvUrl?: string;
  cvFileName?: string;
  coverLetterFileName?: string;
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
  coverLetterFile: File;
  cvFile: File;
}

export interface StatusUpdatePayload {
  status: Application['status'];
  employerNote?: string;
}
