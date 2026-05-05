import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAdmin } from '../../hooks/useAdmin';
import { LogOut, User, Dumbbell, ShieldCheck, LayoutDashboard, Settings, TrendingUp } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isAdmin } = useAdmin();
  const location = useLocation();

  if (!user) return null;

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'History', path: '/history', icon: TrendingUp },
  ];

  if (isAdmin) {
    navLinks.push({ name: 'Admin', path: '/admin', icon: Settings });
  }

  return (
    <nav className="bg-white border-b border-zinc-100 px-4 py-3 sticky top-0 z-50 safe-top">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-zinc-900 p-1.5 rounded-lg">
              <Dumbbell className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-zinc-900">FitTrace</span>
          </Link>

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
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 pr-2 border-r border-zinc-200">
            {isAdmin && (
              <span className="hidden md:flex bg-amber-100 text-amber-700 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded items-center gap-1 mr-2">
                <ShieldCheck className="w-3 h-3" />
                Admin
              </span>
            )}
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-zinc-200" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center">
                <User className="text-zinc-400 w-5 h-5" />
              </div>
            )}
            <span className="hidden sm:block text-sm font-medium text-zinc-700">{user.displayName?.split(' ')[0]}</span>
          </div>
          
          <button
            onClick={logout}
            className="text-zinc-500 hover:text-zinc-900 transition-colors p-1"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
