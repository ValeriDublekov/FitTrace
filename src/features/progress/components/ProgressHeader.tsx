import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Clock } from 'lucide-react';
import { Exercise } from '../../../types';

interface ProgressHeaderProps {
  selectedExercise: Exercise | undefined;
}

export const ProgressHeader: React.FC<ProgressHeaderProps> = ({ selectedExercise }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
          <TrendingUp className="text-indigo-600" />
          {t('workout.progress.title')}
        </h1>
        <p className="text-zinc-500 mt-1">
          {selectedExercise 
            ? t('workout.progress.tracking', { name: selectedExercise.name }) 
            : t('workout.progress.description')}
        </p>
      </div>
      
      <button 
        onClick={() => navigate('/new-workout?mode=manual')}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-zinc-900 text-zinc-900 rounded-2xl hover:bg-zinc-50 active:scale-95 transition-all font-bold shadow-sm"
      >
        <Clock className="w-5 h-5" />
        {t('workout.progress.log_past')}
      </button>
    </header>
  );
};
