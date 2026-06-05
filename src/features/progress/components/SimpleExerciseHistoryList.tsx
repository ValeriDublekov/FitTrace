import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Dumbbell, Calendar, Check } from 'lucide-react';
import { Workout, Exercise } from '../../../types';

interface SimpleExerciseHistoryListProps {
  history: Workout[];
  exercises: Exercise[];
  onSelectWorkout?: (workout: Workout) => void;
}

const PRESET_CATEGORIES = [
  'Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Core', 'Cardio', 'Full Body'
];

export const SimpleExerciseHistoryList: React.FC<SimpleExerciseHistoryListProps> = ({
  history,
  exercises,
  onSelectWorkout
}) => {
  const { t, i18n } = useTranslation();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Unique categories existing in templates or presets
  const categoriesList = useMemo(() => {
    const exerciseCats = exercises.map(ex => ex.category).filter(Boolean);
    const combined = Array.from(new Set([...PRESET_CATEGORIES, ...exerciseCats]));
    // Sort categories alphabetically or keep presets first, but alphabetical of localized is usually nice.
    // Let's sort alphabetically based on translation if possible, or just default name.
    return combined.sort((a, b) => {
      const labelA = t(`workout.categories.${a.toLowerCase().replace(' ', '_')}`, { defaultValue: a });
      const labelB = t(`workout.categories.${b.toLowerCase().replace(' ', '_')}`, { defaultValue: b });
      return labelA.localeCompare(labelB, i18n.language);
    });
  }, [exercises, t, i18n.language]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
  };

  // Filter and shape the history based on selected muscle groups (categories)
  const filteredHistory = useMemo(() => {
    return history
      .map(workout => {
        const filteredExercises = workout.exercises.filter(workoutEx => {
          const masterEx = exercises.find(
            e => e.id === workoutEx.exerciseId || e.name.toLowerCase() === workoutEx.exerciseName.toLowerCase()
          );
          const category = masterEx?.category || 'Full Body';
          
          if (selectedCategories.length === 0) return true;
          return selectedCategories.includes(category);
        });

        return {
          ...workout,
          exercises: filteredExercises
        };
      })
      .filter(workout => workout.exercises.length > 0);
  }, [history, exercises, selectedCategories]);

  return (
    <div className="space-y-6">
      {/* Multiselect Filter Panel */}
      <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-black text-zinc-500 uppercase tracking-wider">
            {t('workout.progress.filter_muscle_groups')}
          </h4>
          {selectedCategories.length > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              {t('workout.progress.all_categories')}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {categoriesList.map(category => {
            const isSelected = selectedCategories.includes(category);
            const localizedName = t(`workout.categories.${category.toLowerCase().replace(' ', '_')}`, { defaultValue: category });
            return (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-tight transition-all border ${
                  isSelected
                    ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm'
                    : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
                }`}
              >
                {isSelected && <Check size={12} strokeWidth={3} />}
                {localizedName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Exercises Chronological List */}
      <div className="space-y-6">
        {filteredHistory.length === 0 ? (
          <div className="py-12 text-center bg-white border border-zinc-200 rounded-2xl">
            <Dumbbell className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm font-medium">
              {t('workout.progress.no_matching_exercises')}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredHistory.map(workout => {
              const formattedDate = workout.date.toLocaleDateString(i18n.language, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div key={workout.id} className="space-y-3">
                  {/* Workout Header Divider */}
                  <div className="flex items-center gap-3">
                    <div className="bg-zinc-100 p-2 rounded-lg text-zinc-500">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span 
                      onClick={() => onSelectWorkout?.(workout)}
                      className="text-xs font-black text-zinc-400 uppercase tracking-widest hover:text-indigo-600 cursor-pointer transition-colors"
                    >
                      {formattedDate}
                    </span>
                    <div className="flex-1 h-[1px] bg-zinc-200" />
                  </div>

                  {/* Exercise Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {workout.exercises.map(workoutEx => {
                      const masterEx = exercises.find(
                        e => e.id === workoutEx.exerciseId || e.name.toLowerCase() === workoutEx.exerciseName.toLowerCase()
                      );
                      const category = masterEx?.category || 'Full Body';
                      const thumbnailUrl = masterEx?.thumbnailUrl;
                      const localizedCategory = t(`workout.categories.${category.toLowerCase().replace(' ', '_')}`, { defaultValue: category });

                      return (
                        <div
                          key={workoutEx.id}
                          onClick={() => onSelectWorkout?.(workout)}
                          className="bg-white border border-zinc-200 rounded-2xl p-4 flex items-center gap-4 hover:border-indigo-100 shadow-sm cursor-pointer hover:shadow-md transition-all group"
                        >
                          {/* Image Box */}
                          <div className="w-14 h-14 rounded-xl bg-zinc-50 border border-zinc-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                            {thumbnailUrl ? (
                              <img
                                src={thumbnailUrl}
                                alt={workoutEx.exerciseName}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="text-zinc-400 text-zinc-400 group-hover:text-indigo-500 transition-colors">
                                <Dumbbell className="w-5 h-5" />
                              </div>
                            )}
                          </div>

                          {/* Info Box */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors text-sm break-words leading-tight uppercase tracking-tight">
                              {workoutEx.exerciseName}
                            </h4>
                            <span className="inline-block mt-1 px-2.5 py-1 text-[9px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg uppercase tracking-wider">
                              {localizedCategory}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
