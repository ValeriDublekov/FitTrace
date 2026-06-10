import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Dumbbell, Calendar, Check, Download } from 'lucide-react';
import { Workout, Exercise } from '../../../types';
import { getCategoryColorScheme, getZoneColorScheme } from '../../../utils/colorUtils';

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

  const handleExportCSV = () => {
    const headers = ['дата', 'мускулна група', 'зона', 'име на упражнението', 'максимална тежест'];
    const csvRows: string[] = [];
    csvRows.push(headers.join(';'));

    filteredHistory.forEach(workout => {
      const d = new Date(workout.date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      workout.exercises.forEach(workoutEx => {
        const masterEx = exercises.find(
          e => e.id === workoutEx.exerciseId || e.name.toLowerCase() === workoutEx.exerciseName.toLowerCase()
        );
        const category = masterEx?.category || 'Full Body';
        const localizedCategory = t(`workout.categories.${category.toLowerCase().replace(' ', '_')}`, { defaultValue: category });
        const finalZone = masterEx?.affectedPart || workoutEx.affectedPart || '';

        const maxWeight = workoutEx.sets.reduce((max, s) => {
          const val = s.weight || s.level || 0;
          return val > max ? val : max;
        }, 0);

        const escapeCSV = (val: string | number) => {
          const str = String(val);
          if (str.includes(';') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        };

        const row = [
          escapeCSV(dateStr),
          escapeCSV(localizedCategory),
          escapeCSV(finalZone),
          escapeCSV(workoutEx.exerciseName),
          escapeCSV(maxWeight)
        ];

        csvRows.push(row.join(';'));
      });
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `exercises_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      <div className="space-y-4">
        {filteredHistory.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-50 border border-zinc-200/60 rounded-2xl px-5 py-4 shadow-sm">
            <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">
              {t('workout.progress.exercises_logged', { count: filteredHistory.reduce((acc, curr) => acc + curr.exercises.length, 0) })}
            </span>
            <button
              onClick={handleExportCSV}
              id="export-exercises-csv-btn"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer w-full sm:w-auto justify-center"
            >
              <Download size={14} />
              {t('workout.progress.export_exercises')}
            </button>
          </div>
        )}

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
                      const finalZone = masterEx?.affectedPart || workoutEx.affectedPart;

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
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {(() => {
                                const catColors = getCategoryColorScheme(category);
                                return (
                                  <span className={`inline-block px-2.5 py-1 text-[9px] font-black border rounded-lg uppercase tracking-wider transition-colors ${catColors.text} ${catColors.bg} ${catColors.border}`}>
                                    {localizedCategory}
                                  </span>
                                );
                              })()}
                              {finalZone && (() => {
                                const zoneColors = getZoneColorScheme(finalZone);
                                return (
                                  <span className={`inline-block px-2.5 py-1 text-[9px] font-black border rounded-lg uppercase tracking-wider transition-colors ${zoneColors.text} ${zoneColors.bg} ${zoneColors.border}`}>
                                    {finalZone}
                                  </span>
                                );
                              })()}
                            </div>
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
