import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { PlusCircle, History, TrendingUp, Activity, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const hasActiveSession = React.useMemo(() => {
    const saved = localStorage.getItem('active_exercises');
    if (!saved) return false;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0;
    } catch {
      return false;
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight font-sans">
          {t('dashboard.greeting', { name: user?.displayName?.split(' ')[0] })}
        </h1>
        <p className="text-zinc-500 mt-1">{t('dashboard.ready')}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hasActiveSession && (
          <motion.button
            key="continue-session"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/new-workout')}
            className="col-span-full bg-indigo-600 text-white p-6 rounded-3xl flex items-center justify-between shadow-lg shadow-indigo-100 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl animate-pulse">
                <Activity className="w-6 h-6" />
              </div>
              <div className="text-left font-sans">
                <h3 className="font-bold text-xl">{t('dashboard.continue_session')}</h3>
                <p className="text-indigo-100 text-sm mt-1">{t('dashboard.active_session_desc')}</p>
              </div>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-sm">
              {t('dashboard.active')}
            </div>
          </motion.button>
        )}

        <motion.button
          key="new-workout"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/new-workout')}
          className="bg-zinc-900 text-white p-6 rounded-3xl flex flex-col items-start gap-4 shadow-lg active:shadow-md transition-all group"
        >
          <div className="bg-white/10 p-3 rounded-2xl group-hover:bg-white/20 transition-colors">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div className="text-left font-sans">
            <h3 className="font-bold text-xl text-white">{t('dashboard.new_workout')}</h3>
            <p className="text-zinc-400 text-sm mt-1">{t('dashboard.new_workout_desc')}</p>
          </div>
        </motion.button>

        <motion.button
          key="manual-workout"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/new-workout?mode=manual')}
          className="bg-white border border-amber-200 p-6 rounded-3xl flex flex-col items-start gap-4 shadow-sm active:shadow-none transition-all group hover:border-amber-400"
        >
          <div className="bg-amber-50 p-3 rounded-2xl group-hover:bg-amber-100 transition-colors">
            <Calendar className="w-6 h-6 text-amber-600" />
          </div>
          <div className="text-left font-sans">
            <h3 className="font-bold text-xl text-zinc-900">{t('dashboard.add_past')}</h3>
            <p className="text-amber-600/60 text-sm mt-1 font-medium italic">{t('dashboard.add_past_desc')}</p>
          </div>
        </motion.button>

        <motion.button
          key="history-nav"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/history')}
          className="bg-white border border-zinc-200 p-6 rounded-3xl flex flex-col items-start gap-4 shadow-sm active:shadow-none transition-all group"
        >
          <div className="bg-zinc-100 p-3 rounded-2xl group-hover:bg-zinc-200 transition-colors">
            <History className="w-6 h-6 text-zinc-600" />
          </div>
          <div className="text-left font-sans">
            <h3 className="font-bold text-xl text-zinc-900">{t('dashboard.history')}</h3>
            <p className="text-zinc-500 text-sm mt-1">{t('dashboard.history_desc')}</p>
          </div>
        </motion.button>

        <motion.button
          key="progress-nav"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/history')}
          className="bg-white border border-zinc-200 p-6 rounded-3xl flex flex-col items-start gap-4 shadow-sm active:shadow-none transition-all group"
        >
          <div className="bg-zinc-100 p-3 rounded-2xl group-hover:bg-zinc-200 transition-colors">
            <TrendingUp className="w-6 h-6 text-zinc-600" />
          </div>
          <div className="text-left font-sans">
            <h3 className="font-bold text-xl text-zinc-900">{t('dashboard.analytics')}</h3>
            <p className="text-zinc-500 text-sm mt-1">{t('dashboard.analytics_desc')}</p>
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default Dashboard;
