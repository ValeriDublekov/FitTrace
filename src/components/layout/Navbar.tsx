import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAdmin } from '../../hooks/useAdmin';
import { useWorkoutContext } from '../../features/workout/context/WorkoutSessionContext';
import { useTranslation } from 'react-i18next';
import UserMenu from './UserMenu';
import { Dumbbell, ShieldCheck, LayoutDashboard, User, TrendingUp, Globe, Timer, Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { activeExercises } = useWorkoutContext();
  const { t } = useTranslation();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return null;

  const hasActiveSession = activeExercises.length > 0;
  const isWorkoutPage = location.pathname === '/new-workout';

  const navLinks = [
    { name: t('navbar.dashboard'), path: '/', icon: LayoutDashboard },
    { name: t('navbar.history'), path: '/history', icon: TrendingUp },
    { name: t('navbar.exercises'), path: '/my-exercises', icon: User },
  ];

  if (isAdmin) {
    navLinks.push({ name: t('navbar.admin'), path: '/admin', icon: Globe });
  }

  return (
    <nav className="bg-white border-b border-zinc-100 px-4 py-3 sticky top-0 z-50 safe-top">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-zinc-900 p-1.5 rounded-lg">
              <Dumbbell className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-zinc-900">FitTrace</span>
          </Link>
        </div>

        <div className="hidden sm:flex items-center gap-4 ml-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                location.pathname === link.path
                  ? 'bg-zinc-100 text-zinc-900'
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              <link.icon className="w-4 h-4" />
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {hasActiveSession && !isWorkoutPage && (
            <Link 
              to="/new-workout"
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 hover:bg-indigo-100 transition-all group"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest hidden xs:block">{t('navbar.new_workout')}</span>
              <Timer className="w-3.5 h-3.5" />
            </Link>
          )}

          <div className="flex items-center gap-1">
            {isAdmin && (
              <span className="hidden md:flex bg-amber-100 text-amber-700 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded items-center gap-1 mr-2">
                <ShieldCheck className="w-3 h-3" />
                {t('navbar.admin')}
              </span>
            )}
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

