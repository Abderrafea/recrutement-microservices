import type { ReactNode } from 'react';
import { BarChart3, Briefcase, FileText, ShieldCheck, UserCircle2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import type { Role } from '../../types/user.types';
import { cn } from '../../utils/cn';

const roleLabels: Record<Role, string> = {
  CANDIDATE: 'Candidat',
  EMPLOYER: 'Employeur',
  ADMIN: 'Admin',
};

const roleLinks: Record<Role, Array<{ label: string; to: string; icon: ReactNode }>> = {
  CANDIDATE: [
    { label: 'Tableau de bord', to: '/candidate/dashboard', icon: <BarChart3 size={16} /> },
    { label: 'Candidatures', to: '/candidate/applications', icon: <FileText size={16} /> },
    { label: 'Profil', to: '/candidate/profile', icon: <UserCircle2 size={16} /> },
  ],
  EMPLOYER: [
    { label: 'Tableau de bord', to: '/employer/dashboard', icon: <BarChart3 size={16} /> },
    { label: 'Gérer les offres', to: '/employer/jobs', icon: <Briefcase size={16} /> },
    { label: 'Profil', to: '/employer/profile', icon: <UserCircle2 size={16} /> },
  ],
  ADMIN: [
    { label: 'Tableau de bord', to: '/admin/dashboard', icon: <ShieldCheck size={16} /> },
    { label: 'Utilisateurs', to: '/admin/users', icon: <UserCircle2 size={16} /> },
    { label: 'Rapports', to: '/admin/reports', icon: <BarChart3 size={16} /> },
  ],
};

export function Sidebar({ role }: { role: Role }) {
  return (
    <aside className="glass-panel hidden h-fit w-72 rounded-[32px] border border-white/70 p-6 shadow-panel lg:block">
      <p className="text-xs uppercase tracking-[0.24em] text-ink/45">Espace {roleLabels[role]}</p>
      <div className="mt-5 flex flex-col gap-2">
        {roleLinks[role].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-ink/70 transition hover:bg-white',
                isActive && 'bg-white text-coral shadow-sm',
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
