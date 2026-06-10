import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link2, X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { WorkoutExercise } from '../../types';

interface CombineExercisesModalProps {
  isOpen: boolean;
  activeExercises: WorkoutExercise[];
  onCombine: (selectedIds: string[]) => void;
  onCancel: () => void;
}

export const CombineExercisesModal: React.FC<CombineExercisesModalProps> = ({
  isOpen,
  activeExercises,
  onCombine,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCombine = () => {
    if (selectedIds.length < 2) return;
    onCombine(selectedIds);
    setSelectedIds([]);
    onCancel();
  };

  // Only exercises that can be combined (or even show existing, but we'll show all and if they combine them, they form a new superset)
  const exercisableList = activeExercises;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6" id="combine-modal-overlay">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          id="combine-modal-content"
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-2xl text-indigo-600 bg-indigo-50">
                <Link2 className="w-6 h-6" />
              </div>
              <button
                onClick={onCancel}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-2">
              {t('workout.combine_title', 'Комбинирай в Суперсерия')}
            </h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              {t(
                'workout.combine_description',
                'Изберете две или повече упражнения от сесията, които да изпълнявате комбинирано (серия от първото, серия от второто...).'
              )}
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {exercisableList.length > 0 ? (
                exercisableList.map((ex) => {
                  const isChecked = selectedIds.includes(ex.id);
                  return (
                    <button
                      key={ex.id}
                      onClick={() => toggleSelect(ex.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 text-left transition-all ${
                        isChecked
                          ? 'border-indigo-600 bg-indigo-50/50'
                          : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-3">
                        <p className={`font-bold truncate ${isChecked ? 'text-indigo-900' : 'text-slate-800'}`}>
                          {ex.exerciseName}
                        </p>
                        <p className="text-xs text-slate-400">
                          {ex.sets.length} {ex.sets.length === 1 ? t('workout.sets_singular', 'серия') : t('workout.sets_plural', 'серии')}
                          {ex.supersetGroupId && ` • ${t('workout.already_grouped', 'Вече в суперсерия')}`}
                        </p>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                          isChecked ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-slate-200'
                        }`}
                      >
                        {isChecked && <Check size={14} strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })
              ) : (
                <p className="text-center text-sm text-slate-400 py-4">
                  {t('workout.no_exercises_to_combine', 'Няма добавени упражнения.')}
                </p>
              )}
            </div>
          </div>

          <div className="px-6 py-5 bg-slate-50 flex flex-col sm:flex-row-reverse gap-3">
            <button
              onClick={handleCombine}
              disabled={selectedIds.length < 2}
              className={`px-6 py-4 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg text-center ${
                selectedIds.length >= 2
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100 active:scale-95'
                  : 'bg-slate-300 shadow-none cursor-not-allowed'
              }`}
              id="combine-modal-action-btn"
            >
              {t('workout.combine_confirm', 'Комбинирай')} ({selectedIds.length})
            </button>
            <button
              onClick={onCancel}
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
