import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Download, RefreshCw } from 'lucide-react';
import { PersistedWorkout, PersistedExercise, LoadType, ExerciseSet } from '../../../types';

interface HistoryFiltersProps {
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  onClear: () => void;
  workouts: PersistedWorkout[];
  exercises: PersistedExercise[];
}

export const HistoryFilters: React.FC<HistoryFiltersProps> = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onClear,
  workouts,
  exercises,
}) => {
  const { t } = useTranslation();

  const sanitizeValue = (val: string | undefined | null) => {
    if (val === undefined || val === null) return '';
    return String(val)
      .replace(/[\r\n]+/g, ' ')
      .replace(/;/g, ' ')
      .trim();
  };

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const formatLoad = (set: ExerciseSet, loadType: LoadType) => {
    if (loadType === 'CARDIO') {
      const parts = [];
      if (set.duration) parts.push(`${set.duration} min`);
      if (set.weight) parts.push(`${set.weight} kg`);
      return parts.join(', ') || '-';
    }
    if (loadType === 'LEVEL_REPS') {
      const parts = [];
      if (set.level !== undefined) parts.push(`Lvl ${set.level}`);
      if (set.reps !== undefined) parts.push(`${set.reps} reps`);
      return parts.join(' x ') || '-';
    }
    // WEIGHT_REPS
    const parts = [];
    if (set.weight !== undefined) parts.push(`${set.weight} kg`);
    if (set.reps !== undefined) parts.push(`${set.reps} reps`);
    return parts.join(' x ') || '-';
  };

  const handleExportCSV = () => {
    const rows: string[] = [];

    // Headers in localized or Bulgarian/English standard
    const headers = [
      t('workout.progress.csv_headers.date'),
      t('workout.progress.csv_headers.category'),
      t('workout.progress.csv_headers.zone'),
      t('workout.progress.csv_headers.name'),
      t('workout.progress.csv_headers.weight'),
      t('workout.progress.csv_headers.notes'),
    ];
    rows.push(headers.join(';'));

    workouts.forEach((workout) => {
      const dateStr = formatDate(workout.date);

      workout.exercises.forEach((workoutEx) => {
        const exerciseDef = exercises.find((e) => e.id === workoutEx.exerciseId);
        const categoryKey = exerciseDef?.category || '';
        const translatedCategory = categoryKey
          ? t(`workout.categories.${categoryKey.toLowerCase()}`, categoryKey)
          : '';

        const muscleZone = workoutEx.affectedPart || exerciseDef?.affectedPart || '';
        const exerciseName = workoutEx.exerciseName;

        const notesParts = [];
        if (workoutEx.sessionNotes) {
          notesParts.push(workoutEx.sessionNotes);
        }
        if (workout.notes) {
          notesParts.push(`[Workout: ${workout.notes}]`);
        }
        const combinedNotes = notesParts.join(' ');

        const completedSets = workoutEx.sets.filter((s) => s.isCompleted !== false);
        const setsToExport = completedSets.length > 0 ? completedSets : workoutEx.sets;

        if (setsToExport.length === 0) {
          const row = [
            sanitizeValue(dateStr),
            sanitizeValue(translatedCategory),
            sanitizeValue(muscleZone),
            sanitizeValue(exerciseName),
            '-',
            sanitizeValue(combinedNotes),
          ];
          rows.push(row.join(';'));
        } else {
          setsToExport.forEach((set) => {
            const loadVal = formatLoad(set, exerciseDef?.loadType || 'WEIGHT_REPS');
            const row = [
              sanitizeValue(dateStr),
              sanitizeValue(translatedCategory),
              sanitizeValue(muscleZone),
              sanitizeValue(exerciseName),
              sanitizeValue(loadVal),
              sanitizeValue(combinedNotes),
            ];
            rows.push(row.join(';'));
          });
        }
      });
    });

    const csvContent = '\uFEFF' + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `workout_history_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasFilters = startDate !== '' || endDate !== '';

  return (
    <div id="history-filters-container" className="bg-white border border-zinc-200 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        {/* Start Date */}
        <div className="flex-1 space-y-2">
          <label htmlFor="start-date-input" className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <Calendar size={14} className="text-zinc-400" />
            {t('workout.progress.start_date')}
          </label>
          <input
            id="start-date-input"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-800 font-bold focus:outline-none focus:border-zinc-900 transition-all text-sm"
          />
        </div>

        {/* End Date */}
        <div className="flex-1 space-y-2">
          <label htmlFor="end-date-input" className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <Calendar size={14} className="text-zinc-400" />
            {t('workout.progress.end_date')}
          </label>
          <input
            id="end-date-input"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-800 font-bold focus:outline-none focus:border-zinc-900 transition-all text-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full md:w-auto">
          {hasFilters && (
            <button
              id="clear-filters-btn"
              onClick={onClear}
              className="px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 text-sm"
              title="Изчисти филтрите"
            >
              <RefreshCw size={16} />
              <span className="md:hidden lg:inline">Изчисти</span>
            </button>
          )}

          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            disabled={workouts.length === 0}
            className={`flex-1 md:flex-initial px-6 py-3 rounded-2xl font-black text-white bg-zinc-900 hover:bg-zinc-800 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm shadow-sm ${
              workouts.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Download size={16} />
            {t('workout.progress.export_csv_btn')}
          </button>
        </div>
      </div>
      
      {workouts.length === 0 && (
        <p className="text-xs text-zinc-400 italic">
          Няма данни за експортиране за избрания период.
        </p>
      )}
    </div>
  );
};
