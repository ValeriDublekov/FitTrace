import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';

const CATEGORIES = [
  'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Full Body'
];

interface CategorySelectorProps {
  onSelect: (category: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ onSelect }) => {
  return (
    <div className="space-y-6 pb-20">
      <header className="space-y-1">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Step 1 of 2</h2>
        <p className="text-2xl font-black text-slate-900 tracking-tight">Select Muscle Group</p>
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
              <span className="font-bold text-lg text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">{category}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Area</span>
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
