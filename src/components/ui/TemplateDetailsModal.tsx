import React from 'react';
import { useTranslation } from 'react-i18next';
import { WorkoutTemplate, Exercise } from '../../types';
import { X, Dumbbell, Play, Edit3, Trash2, Calendar, Target } from 'lucide-react';
import { getCategoryColorScheme, getZoneColorScheme } from '../../utils/colorUtils';

interface TemplateDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: WorkoutTemplate;
  exercises: Exercise[];
  onStart: (mode: 'LIVE' | 'MANUAL') => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const TemplateDetailsModal: React.FC<TemplateDetailsModalProps> = ({
  isOpen,
  onClose,
  template,
  exercises,
  onStart,
  onEdit,
  onDelete
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  // Resolve template exercises
  const templateExercises = template.exerciseIds
    .map(id => exercises.find(ex => ex.id === id))
    .filter((ex): ex is Exercise => !!ex);

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" id="template-details-modal">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-white">
          <div>
            <h2 className="font-black text-xl text-zinc-900 leading-tight">
              {template.name}
            </h2>
            <p className="text-xs text-zinc-400 font-bold mt-1 uppercase tracking-wider">
              {templateExercises.length} {t('workout.exercises')}
            </p>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-zinc-100 rounded-xl transition-all">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Exercises List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2">
            {t('workout.available_exercises')}
          </label>
          {templateExercises.map((ex, idx) => {
            const catColors = getCategoryColorScheme(ex.category);
            return (
              <div 
                key={idx} 
                className="p-3.5 bg-zinc-50 border border-zinc-150 rounded-2xl flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 border border-zinc-200 rounded-xl text-indigo-600">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-zinc-900 text-sm block">
                      {ex.name}
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1 items-center">
                      <span className={`text-[10px] font-black border px-1.5 py-0.5 rounded-md uppercase tracking-wider inline-block ${catColors.text} ${catColors.bg} ${catColors.border}`}>
                        {t(`workout.categories.${ex.category.toLowerCase().replace(' ', '_')}`, { defaultValue: ex.category })}
                      </span>
                      {ex.affectedPart && (() => {
                        const zoneColors = getZoneColorScheme(ex.affectedPart);
                        return (
                          <span className={`text-[10px] font-black border px-1.5 py-0.5 rounded-md uppercase tracking-wider inline-flex items-center gap-0.5 ${zoneColors.text} ${zoneColors.bg} ${zoneColors.border}`}>
                            <Target className="w-3 h-3 shrink-0" />
                            {ex.affectedPart}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onStart('LIVE')}
              className="py-4 bg-zinc-900 hover:bg-zinc-850 text-white rounded-2xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Play size={16} fill="currentColor" />
              {t('workout.templates.start_live')}
            </button>
            <button
              onClick={() => onStart('MANUAL')}
              className="py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Calendar size={16} />
              {t('workout.templates.start_manual')}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-1.5 pt-3 border-t border-zinc-200">
            <button
              onClick={onEdit}
              className="py-3 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Edit3 size={15} />
              {t('common.edit')}
            </button>
            <button
              onClick={onDelete}
              className="py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Trash2 size={15} />
              {t('common.delete')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
