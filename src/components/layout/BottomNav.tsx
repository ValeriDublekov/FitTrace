import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAdmin } from '../../hooks/useAdmin';
import { useWorkoutContext } from '../../features/workout/context/WorkoutSessionContext';
import { LayoutDashboard, History as HistoryIcon, TrendingUp, User, Globe } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { isAdmin } = useAdmin();
  const { hasActiveSession } = useWorkoutContext();

  // Hide bottom nav during active workout session to save space on mobile
  if (hasActiveSession) {
    return null;
  }

  const navLinks = [
    { name: t('navbar.dashboard'), path: '/', icon: LayoutDashboard },
    { name: t('navbar.history'), path: '/history', icon: HistoryIcon },
    { name: t('navbar.progress'), path: '/progress', icon: TrendingUp },
    { name: t('navbar.exercises'), path: '/my-exercises', icon: User },
  ];

  if (isAdmin) {
    navLinks.push({ name: t('navbar.admin'), path: '/admin', icon: Globe });
  }

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 px-6 py-3 pb-8 z-50 flex justify-between items-center safe-bottom">
      {navLinks.map((link) => {
        const isActive = location.pathname === link.path;
        return (
          <Link
            key={link.path}
            to={link.path}
            className={`flex flex-col items-center gap-1 transition-all ${
              isActive ? 'text-indigo-600' : 'text-slate-400'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-indigo-50 shadow-sm' : ''}`}>
              <link.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">
              {link.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
