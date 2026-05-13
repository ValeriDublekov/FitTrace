import React from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ActiveSessionHeaderProps {
  sessionMode: 'LIVE' | 'MANUAL';
  onAddClick: () => void;
}

export const ActiveSessionHeader: React.FC<ActiveSessionHeaderProps> = ({
  sessionMode,
  onAddClick
}) => {
  const { t } = useTranslation();

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex-1">
        <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full inline-block ${
          sessionMode === 'LIVE'
            ? 'text-indigo-600 bg-indigo-50 border border-indigo-100' 
            : 'text-amber-600 bg-amber-50 border border-amber-100'
        }`}>
          {sessionMode === 'LIVE' ? t('workout.modes.live') : t('workout.modes.manual')}
        </h2>
      </div>

      <button
        onClick={onAddClick}
        className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 active:scale-95 transition-all shadow-xl shadow-slate-200 font-bold text-xs uppercase tracking-widest"
      >
        <Plus size={20} strokeWidth={2.5} />
        {t('workout.add_exercise')}
      </button>
    </header>
  );
};
