import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, Play, Edit3 } from 'lucide-react';
import { useWorkoutContext } from '../context/WorkoutSessionContext';

interface WorkoutSetupProps {
  onNext: () => void;
}

export const WorkoutSetup: React.FC<WorkoutSetupProps> = ({ onNext }) => {
  const { workoutDate, setWorkoutDate, sessionMode, setSessionMode } = useWorkoutContext();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Format date for date input (YYYY-MM-DD)
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
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
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Workout Setup</h2>
        <p className="text-slate-500">First, let's set the date and mode for your session.</p>
      </div>

      <div className="space-y-6">
        {/* Date Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
            When did you train?
          </label>
          <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 group transition-all">
            <Calendar size={24} className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="date"
              value={formatDateForInput(workoutDate)}
              onChange={handleDateChange}
              max={maxDate}
              className="text-lg font-bold text-slate-900 bg-transparent border-none p-0 focus:ring-0 cursor-pointer w-full"
              id="setup-date-input"
            />
          </div>
        </div>

        {/* Mode Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
            Session Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSessionMode('LIVE')}
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
                <p className={`font-bold ${sessionMode === 'LIVE' ? 'text-indigo-900' : 'text-slate-900'}`}>Live Session</p>
                <p className="text-xs text-slate-500">Record as you train with rest timers.</p>
              </div>
            </button>

            <button
              onClick={() => setSessionMode('MANUAL')}
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
                <p className={`font-bold ${sessionMode === 'MANUAL' ? 'text-amber-900' : 'text-slate-900'}`}>Manual Log</p>
                <p className="text-xs text-slate-500">Log a completed workout from the past.</p>
              </div>
            </button>
          </div>
        </div>
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
        onClick={() => navigate('/')}
        className="w-full py-4 mt-3 bg-slate-100 text-slate-900 rounded-2xl font-black text-lg hover:bg-slate-200 active:scale-[0.98] transition-all flex items-center justify-center"
      >
        {t('common.cancel')}
      </button>
    </div>
  );
};
