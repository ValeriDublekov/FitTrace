import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Trophy, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { Workout } from '../../../types';
import { formatDuration } from '../../../utils/dateUtils';

interface WorkoutSummaryProps {
  workout: Workout;
  onClose: () => void;
}

export const WorkoutSummary: React.FC<WorkoutSummaryProps> = ({ workout, onClose }) => {
  const { t } = useTranslation();

  const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto px-6 py-8 space-y-8 pb-32"
    >
      <div className="text-center space-y-4">
        <motion.div 
          initial={{ scale: 0.5, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12 }}
          className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-500 shadow-xl shadow-amber-100/50"
        >
          <Trophy size={48} strokeWidth={2.5} />
        </motion.div>
        
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
            {t('workout.summary.title')}
          </h1>
          <p className="text-slate-500 font-medium">
            {t('workout.summary.subtitle')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
          <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('workout.summary.duration')}</p>
            <p className="text-xl font-black text-slate-900 tracking-tighter">
              {workout.durationSeconds ? formatDuration(workout.durationSeconds) : '--:--'}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
          <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('workout.summary.sets')}</p>
            <p className="text-xl font-black text-slate-900 tracking-tighter">
              {totalSets}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest ml-1">
          {t('workout.summary.exercises_done')}
        </h3>
        
        <div className="space-y-3">
          {workout.exercises.map((ex, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 text-xs font-black">
                  {idx + 1}
                </div>
                <div>
                  <p className="font-bold text-slate-900 leading-tight">{ex.exerciseName}</p>
                  <p className="text-xs font-medium text-slate-400">{ex.sets.length} {t('workout.summary.sets')}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        {t('workout.summary.finish')}
        <ChevronRight size={18} />
      </button>
    </motion.div>
  );
};
