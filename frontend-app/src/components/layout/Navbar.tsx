import { BriefcaseBusiness, ChartColumnBig, LogOut, UserCircle2 } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';

export function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-40 px-4 pt-4 md:px-8">
      <div className="glass-panel mx-auto flex max-w-7xl items-center justify-between gap-6 rounded-[28px] border border-white/70 px-6 py-4 shadow-panel">
        <Link to="/" className="flex items-center gap-3 text-ink">
          <span className="rounded-2xl bg-coral px-3 py-2 text-white">
            <BriefcaseBusiness size={18} />
          </span>
          <span className="font-display text-xl font-bold">RecruitFlow</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-semibold text-ink/70 md:flex">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'text-coral' : undefined)}>
            Accueil
          </NavLink>
          <NavLink to="/jobs" className={({ isActive }) => (isActive ? 'text-coral' : undefined)}>
            Offres
          </NavLink>
          {user?.role === 'EMPLOYER' && (
            <NavLink to="/employer/dashboard" className={({ isActive }) => (isActive ? 'text-coral' : undefined)}>
              Espace Employeur
            </NavLink>
          )}
          {user?.role === 'CANDIDATE' && (
            <NavLink to="/candidate/dashboard" className={({ isActive }) => (isActive ? 'text-coral' : undefined)}>
              Espace Candidat
            </NavLink>
          )}
          {user?.role === 'ADMIN' && (
            <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? 'text-coral' : undefined)}>
              Analytique
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <div className="hidden items-center gap-2 rounded-full bg-ink/5 px-4 py-2 text-sm text-ink md:flex">
                {user.role === 'ADMIN' ? <ChartColumnBig size={16} /> : <UserCircle2 size={16} />}
                <span>{user.firstName} {user.lastName}</span>
              </div>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut size={16} />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Connexion
              </Button>
              <Button onClick={() => navigate('/register')}>Commencer</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
