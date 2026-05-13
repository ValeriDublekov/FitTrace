import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ActiveSessionFooterProps {
  workoutNotes: string;
  setWorkoutNotes: (notes: string) => void;
  onFinishRequest: () => void;
}

export const ActiveSessionFooter: React.FC<ActiveSessionFooterProps> = ({
  workoutNotes,
  setWorkoutNotes,
  onFinishRequest
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 pt-4">
      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">{t('workout.notes')}</h4>
        <textarea
          placeholder={t('workout.notes_placeholder')}
          value={workoutNotes}
          onChange={(e) => setWorkoutNotes(e.target.value)}
          className="w-full p-5 bg-white border border-slate-200 rounded-3xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all min-h-[100px] resize-none"
        />
      </div>
      
      <button
        onClick={onFinishRequest}
        className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <CheckCircle2 size={20} />
        {t('workout.finish_workout')}
      </button>
    </div>
  );
};
