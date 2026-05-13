import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CATEGORIES = [
  'Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Core', 'Cardio', 'Full Body'
];

interface CategorySelectorProps {
  onSelect: (category: string) => void;
  onBack: () => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ onSelect, onBack }) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6 pb-20">
      <button 
        onClick={onBack}
        className="flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={16} className="mr-1" />
        {t('common.back')}
      </button>

      <header className="space-y-1">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('workout.start_session')}</h2>
        <p className="text-2xl font-black text-slate-900 tracking-tight">{t('workout.titles.select_category')}</p>
      </header>
      
      <div className="grid grid-cols-1 gap-3">
        {CATEGORIES.map((category) => (
          <motion.button
            key={category}
            id={`category-${category.toLowerCase()}`}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(category)}
            className="flex items-center justify-between p-5 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-200 transition-all group"
          >
            <div className="flex flex-col items-start gap-1">
              <span className="font-bold text-lg text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                {t(`workout.categories.${category.toLowerCase().replace(' ', '_')}`)}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('workout.target_area')}</span>
            </div>
            <div className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
              <ChevronRight size={20} strokeWidth={2.5} />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
