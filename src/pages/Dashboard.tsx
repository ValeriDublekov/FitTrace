import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { PlusCircle, History, TrendingUp, Activity, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { useWorkoutContext } from '../features/workout/context/WorkoutSessionContext';
import { ActionPromptModal } from '../components/ui/ActionPromptModal';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { 
    hasActiveSession, 
    isActiveLive, 
    isActiveManual, 
    workoutDate, 
    workoutStartedAt,
    clearSession,
    finishWorkout
  } = useWorkoutContext();

  const [conflictModal, setConflictModal] = useState<{
    isOpen: boolean;
    type: 'START_LIVE_WHILE_MANUAL' | 'START_MANUAL_WHILE_LIVE';
  }>({ isOpen: false, type: 'START_LIVE_WHILE_MANUAL' });

  const handleStartLive = () => {
    if (isActiveManual) {
      setConflictModal({ isOpen: true, type: 'START_LIVE_WHILE_MANUAL' });
    } else {
      navigate('/new-workout');
    }
  };

  const handleStartManual = () => {
    if (isActiveLive) {
      setConflictModal({ isOpen: true, type: 'START_MANUAL_WHILE_LIVE' });
    } else {
      navigate('/new-workout?mode=manual');
    }
  };

  const formatStartTime = (date: Date | null) => {
    if (!date) return '';
    return new Intl.DateTimeFormat(i18n.language, {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(i18n.language, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(isActiveManual ? '/new-workout?mode=manual' : '/new-workout')}
            className={`col-span-full p-6 rounded-3xl flex items-center justify-between shadow-lg transition-all group border-2 ${
              isActiveLive 
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-100' 
                : 'bg-amber-500 border-amber-400 text-white shadow-amber-100'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl animate-pulse">
                {isActiveLive ? <Activity className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
              </div>
              <div className="text-left font-sans">
                <h3 className="font-bold text-xl">
                  {isActiveLive ? t('dashboard.continue_session') : t('dashboard.continue_manual')}
                </h3>
                <p className="text-white/80 text-sm mt-1">
                  {isActiveLive 
                    ? `${t('dashboard.started_at')} ${formatStartTime(workoutStartedAt)}`
                    : `${t('dashboard.draft_for')} ${formatDate(workoutDate)}`
                  }
                </p>
              </div>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-sm shadow-inner group-hover:bg-white/20 transition-colors">
              {t('common.continue')}
            </div>
          </motion.button>
        )}

        <motion.button
          key="new-workout"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStartLive}
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
          onClick={handleStartManual}
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
          onClick={() => navigate('/progress')}
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

      <ActionPromptModal
        isOpen={conflictModal.isOpen}
        title={conflictModal.type === 'START_LIVE_WHILE_MANUAL' ? t('dashboard.manual_draft_active') : t('dashboard.live_session_active')}
        message={conflictModal.type === 'START_LIVE_WHILE_MANUAL' ? t('dashboard.manual_draft_desc') : t('dashboard.live_session_desc')}
        yesLabel={t('common.continue')}
        noLabel={t('common.discard')}
        cancelLabel={t('common.cancel')}
        onYes={() => {
          setConflictModal({ ...conflictModal, isOpen: false });
          navigate(conflictModal.type === 'START_LIVE_WHILE_MANUAL' ? '/new-workout?mode=manual' : '/new-workout');
        }}
        onNo={() => {
          clearSession();
          setConflictModal({ ...conflictModal, isOpen: false });
          navigate(conflictModal.type === 'START_LIVE_WHILE_MANUAL' ? '/new-workout' : '/new-workout?mode=manual');
        }}
        onCancel={() => setConflictModal({ ...conflictModal, isOpen: false })}
      />
    </div>
  );
};

export default Dashboard;
