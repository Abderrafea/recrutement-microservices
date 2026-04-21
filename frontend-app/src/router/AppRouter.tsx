import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { HomePage } from '../pages/public/HomePage';
import { JobsPage } from '../pages/public/JobsPage';
import { JobDetailPage } from '../pages/public/JobDetailPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { CandidateDashboard } from '../pages/candidate/CandidateDashboard';
import { MyApplicationsPage } from '../pages/candidate/MyApplicationsPage';
import { CandidateProfilePage } from '../pages/candidate/CandidateProfilePage';
import { ApplyPage } from '../pages/candidate/ApplyPage';
import { EmployerDashboard } from '../pages/employer/EmployerDashboard';
import { ManageJobsPage } from '../pages/employer/ManageJobsPage';
import { CreateJobPage } from '../pages/employer/CreateJobPage';
import { EditJobPage } from '../pages/employer/EditJobPage';
import { ViewApplicationsPage } from '../pages/employer/ViewApplicationsPage';
import { EmployerProfilePage } from '../pages/employer/EmployerProfilePage';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UsersManagementPage } from '../pages/admin/UsersManagementPage';
import { ReportsPage } from '../pages/admin/ReportsPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/jobs" element={<JobsPage />} />
      <Route path="/jobs/:id" element={<JobDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute roles={['CANDIDATE']} />}>
        <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
        <Route path="/candidate/applications" element={<MyApplicationsPage />} />
        <Route path="/candidate/profile" element={<CandidateProfilePage />} />
        <Route path="/jobs/:id/apply" element={<ApplyPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={['EMPLOYER']} />}>
        <Route path="/employer/dashboard" element={<EmployerDashboard />} />
        <Route path="/employer/jobs" element={<ManageJobsPage />} />
        <Route path="/employer/jobs/new" element={<CreateJobPage />} />
        <Route path="/employer/jobs/:id/edit" element={<EditJobPage />} />
        <Route path="/employer/jobs/:id/applications" element={<ViewApplicationsPage />} />
        <Route path="/employer/profile" element={<EmployerProfilePage />} />
      </Route>

      <Route element={<ProtectedRoute roles={['ADMIN']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UsersManagementPage />} />
        <Route path="/admin/reports" element={<ReportsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
