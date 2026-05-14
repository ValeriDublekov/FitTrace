import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, Play, Edit3 } from 'lucide-react';
import { useWorkoutContext } from '../context/WorkoutSessionContext';

interface WorkoutSetupProps {
  onNext: () => void;
}

export const WorkoutSetup: React.FC<WorkoutSetupProps> = ({ onNext }) => {
  const { 
    workoutDate, 
    setWorkoutDate, 
    sessionMode, 
    setSessionMode, 
    hasActiveSession,
    clearSession 
  } = useWorkoutContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  
  const isManualMode = searchParams.get('mode') === 'manual';

  const handleCancel = () => {
    // If we haven't started adding exercises, clear any setup data
    if (!hasActiveSession) {
      clearSession();
    }
    navigate('/');
  };

  useEffect(() => {
    if (isManualMode) {
      setSessionMode('MANUAL');
    }
  }, [isManualMode, setSessionMode]);

  const handleModeChange = (mode: 'LIVE' | 'MANUAL') => {
    setSessionMode(mode);
    if (mode === 'LIVE') {
      setWorkoutDate(new Date());
    }
  };

  // Format date for date input (YYYY-MM-DD)
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [year, month, day] = e.target.value.split('-').map(Number);
    const newDate = new Date(year, month - 1, day);
    
    if (!isNaN(newDate.getTime())) {
      // Don't allow future dates
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (newDate > today) {
        setWorkoutDate(new Date());
      } else {
        setWorkoutDate(newDate);
      }
    }
  };

  const maxDate = formatDateForInput(new Date());

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" id="workout-setup">
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('workout.titles.new_workout')}</h2>
        <p className="text-slate-500">{t('workout.setup.desc')}</p>
      </div>

      <div className="space-y-6">
        {/* Date Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
            {t('workout.setup.date_label')}
          </label>
          <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 group transition-all">
            <Calendar size={24} className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="date"
              value={formatDateForInput(workoutDate)}
              onChange={handleDateChange}
              max={maxDate}
              disabled={sessionMode === 'LIVE'}
              className="text-lg font-bold text-slate-900 bg-transparent border-none p-0 focus:ring-0 cursor-pointer w-full disabled:opacity-50"
              id="setup-date-input"
            />
          </div>
          {sessionMode === 'LIVE' && (
            <p className="text-[10px] text-indigo-500 font-medium ml-1">
              * {t('workout.setup.live_date_hint')}
            </p>
          )}
        </div>

        {/* Mode Selection */}
        {!isManualMode && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
              {t('workout.setup.mode_label')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleModeChange('LIVE')}
                className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 ${
                  sessionMode === 'LIVE'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  sessionMode === 'LIVE' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  <Play size={20} fill="currentColor" />
                </div>
                <div>
                  <p className={`font-bold ${sessionMode === 'LIVE' ? 'text-indigo-900' : 'text-slate-900'}`}>{t('workout.modes.live')}</p>
                  <p className="text-xs text-slate-500">{t('dashboard.new_workout_desc')}</p>
                </div>
              </button>

              <button
                onClick={() => handleModeChange('MANUAL')}
                className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 ${
                  sessionMode === 'MANUAL'
                    ? 'border-amber-600 bg-amber-50/50 shadow-sm'
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  sessionMode === 'MANUAL' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  <Edit3 size={20} />
                </div>
                <div>
                  <p className={`font-bold ${sessionMode === 'MANUAL' ? 'text-amber-900' : 'text-slate-900'}`}>{t('workout.modes.manual')}</p>
                  <p className="text-xs text-slate-500">{t('dashboard.add_past_desc')}</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onNext}
        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        id="btn-confirm-setup"
      >
        Continue to Exercises
        <Play size={20} className="fill-current" />
      </button>
      <button
        onClick={handleCancel}
        className="w-full py-4 mt-3 bg-slate-100 text-slate-900 rounded-2xl font-black text-lg hover:bg-slate-200 active:scale-[0.98] transition-all flex items-center justify-center"
      >
        {t('common.cancel')}
      </button>
    </div>
  );
};
