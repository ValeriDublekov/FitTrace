import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link2, X, Check, ArrowUp, ArrowDown, Trash2, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { WorkoutExercise, Exercise } from '../../types';
import { useExercises } from '../../hooks/useExercises';

interface CombineExercisesModalProps {
  isOpen: boolean;
  activeExercises: WorkoutExercise[];
  onCombine: (selectedItems: { id?: string; exerciseId: string; rawExercise?: Exercise }[]) => Promise<void>;
  onCancel: () => void;
}

interface SelectedItem {
  id?: string;
  exerciseId: string;
  exerciseName: string;
  affectedPart?: string;
  category?: string;
  rawExercise?: Exercise;
}

const CATEGORIES = [
  'Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Core', 'Cardio', 'Full Body'
];

export const CombineExercisesModal: React.FC<CombineExercisesModalProps> = ({
  isOpen,
  activeExercises,
  onCombine,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { exercises } = useExercises();
  
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [activeTab, setActiveTab] = useState<'current' | 'all'>('current');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCombining, setIsCombining] = useState(false);

  if (!isOpen) return null;

  const toggleSelectCurrent = (ex: WorkoutExercise) => {
    const isSelected = selectedItems.some((item) => item.id === ex.id);
    if (isSelected) {
      setSelectedItems((prev) => prev.filter((item) => item.id !== ex.id));
    } else {
      setSelectedItems((prev) => [
        ...prev,
        {
          id: ex.id,
          exerciseId: ex.exerciseId,
          exerciseName: ex.exerciseName,
          affectedPart: ex.affectedPart,
        }
      ]);
    }
  };

  const toggleSelectGlobal = (ex: Exercise) => {
    const isSelected = selectedItems.some((item) => !item.id && item.exerciseId === ex.id);
    if (isSelected) {
      setSelectedItems((prev) => prev.filter((item) => item.id || item.exerciseId !== ex.id));
    } else {
      setSelectedItems((prev) => [
        ...prev,
        {
          exerciseId: ex.id!,
          exerciseName: ex.name,
          affectedPart: ex.affectedPart || ex.category,
          category: ex.category,
          rawExercise: ex,
        }
      ]);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setSelectedItems((prev) => {
      const list = [...prev];
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
      return list;
    });
  };

  const moveDown = (index: number) => {
    setSelectedItems((prev) => {
      if (index === prev.length - 1) return prev;
      const list = [...prev];
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
      return list;
    });
  };

  const removeItem = (index: number) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCombine = async () => {
    if (selectedItems.length < 2) return;
    setIsCombining(true);
    try {
      await onCombine(selectedItems);
      setSelectedItems([]);
      onCancel();
    } catch (err) {
      console.error(err);
    } finally {
      setIsCombining(false);
    }
  };

  const filteredGlobalExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || ex.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4" id="combine-modal-overlay">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          className="relative w-full h-[92vh] sm:h-[85vh] sm:max-w-xl bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          id="combine-modal-content"
        >
          {/* Header */}
          <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl text-indigo-600 bg-indigo-50">
                <Link2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {t('workout.combine_title', 'Комбинирай в Суперсерия')}
              </h3>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 min-h-0">
            {/* Selected Exercises Section */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                {t('workout.selected_exercises', 'Избрани за суперсерия')} ({selectedItems.length})
              </h4>
              <div className="border-2 border-dashed border-indigo-100/80 bg-indigo-50/20 rounded-2xl p-3 min-h-[80px] flex flex-col justify-center gap-2">
                {selectedItems.length > 0 ? (
                  selectedItems.map((item, idx) => (
                    <div
                      key={item.id || item.exerciseId}
                      className="flex items-center justify-between p-3 bg-white border border-indigo-100 rounded-xl shadow-sm"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                        <div className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0">
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-xs truncate">
                            {item.exerciseName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {item.affectedPart || t('workout.target_area', 'Целева група')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          disabled={idx === 0}
                          onClick={() => moveUp(idx)}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 disabled:opacity-20 rounded-lg transition-colors"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          disabled={idx === selectedItems.length - 1}
                          onClick={() => moveDown(idx)}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 disabled:opacity-20 rounded-lg transition-colors"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeItem(idx)}
                          className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-xs font-bold text-slate-400 py-4 leading-relaxed whitespace-pre-line">
                    {t('workout.no_selected_exercises', 'Няма избрани упражнения.\nИзберете от списъците по-долу.')}
                  </p>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-2xl shrink-0">
              <button
                onClick={() => setActiveTab('current')}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                  activeTab === 'current'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t('workout.from_current_session', 'Текуща тренировка')}
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                  activeTab === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t('workout.all_exercises', 'Всички упражнения')}
              </button>
            </div>

            {/* Lists */}
            <div className="space-y-4">
              {activeTab === 'current' ? (
                <div className="space-y-2">
                  {activeExercises.length > 0 ? (
                    activeExercises.map((ex) => {
                      const isSelected = selectedItems.some((item) => item.id === ex.id);
                      return (
                        <button
                          key={ex.id}
                          onClick={() => toggleSelectCurrent(ex)}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 text-left transition-all ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                              : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                          }`}
                        >
                          <div className="flex-1 min-w-0 pr-3">
                            <p className={`font-extrabold text-sm truncate ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                              {ex.exerciseName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                              {ex.sets.length} {ex.sets.length === 1 ? t('workout.sets_singular', 'серия') : t('workout.sets_plural', 'серии')}
                              {ex.supersetGroupId && ` • ${t('workout.already_grouped', 'Вече в суперсерия')}`}
                            </p>
                          </div>
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                              isSelected ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-slate-200'
                            }`}
                          >
                            {isSelected && <Check size={14} strokeWidth={3} />}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-center text-sm font-semibold text-slate-400 py-6">
                      {t('workout.no_exercises_to_combine', 'Няма добавени упражнения.')}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Category Pills Selector */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none shrink-0 -mx-1 px-1">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                        selectedCategory === null
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {t('workout.categories.all', 'Всички')}
                    </button>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                          selectedCategory === cat
                            ? 'bg-slate-900 border-slate-900 text-white'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        {t(`workout.categories.${cat.toLowerCase().replace(' ', '_')}`, cat)}
                      </button>
                    ))}
                  </div>

                  {/* Search bar */}
                  <div className="relative shrink-0">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Search className="text-slate-400 w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder={t('workout.search_placeholder', 'Търси упражнение...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  {/* Filtered Global Exercises list */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {filteredGlobalExercises.length > 0 ? (
                      filteredGlobalExercises.map((ex) => {
                        const isSelected = selectedItems.some((item) => !item.id && item.exerciseId === ex.id);
                        return (
                          <button
                            key={ex.id}
                            onClick={() => toggleSelectGlobal(ex)}
                            className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 text-left transition-all ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-50/40'
                                : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                            }`}
                          >
                            <div className="flex-1 min-w-0 pr-3">
                              <p className={`font-extrabold text-xs truncate ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                                {ex.name}
                              </p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                {ex.affectedPart || ex.category}
                              </p>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                                isSelected ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-slate-200'
                              }`}
                            >
                              {isSelected && <Check size={12} strokeWidth={3} />}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-center text-xs font-semibold text-slate-400 py-6">
                        {t('workout.progress.no_history', 'Няма намерени упражнения.')}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-5 bg-slate-50 flex flex-col sm:flex-row-reverse gap-3 border-t border-slate-100 shrink-0">
            <button
              onClick={handleCombine}
              disabled={selectedItems.length < 2 || isCombining}
              className={`px-6 py-4 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg text-center flex items-center justify-center gap-2 ${
                selectedItems.length >= 2 && !isCombining
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100 active:scale-95'
                  : 'bg-slate-300 shadow-none cursor-not-allowed'
              }`}
              id="combine-modal-action-btn"
            >
              {isCombining ? (
                <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
              ) : (
                `${t('workout.combine_confirm', 'Комбинирай')} (${selectedItems.length})`
              )}
            </button>
            <button
              onClick={onCancel}
              disabled={isCombining}
              className="px-6 py-4 text-slate-600 font-black bg-white border border-slate-200 rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-100 transition-all text-center"
              id="combine-modal-cancel-btn"
            >
              {t('common.cancel', 'Отказ')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
