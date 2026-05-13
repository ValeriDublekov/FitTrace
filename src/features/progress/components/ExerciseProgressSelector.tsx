import React from 'react';
import { Search, History as HistoryIcon, Dumbbell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Exercise } from '../../../types';

interface ExerciseProgressSelectorProps {
  exercises: Exercise[];
  loading: boolean;
  selectedExerciseId: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectExercise: (id: string | null) => void;
  showMobileSelector: boolean;
  setShowMobileSelector: (show: boolean) => void;
}

export const ExerciseProgressSelector: React.FC<ExerciseProgressSelectorProps> = ({
  exercises,
  loading,
  selectedExerciseId,
  searchQuery,
  setSearchQuery,
  onSelectExercise,
  showMobileSelector,
  setShowMobileSelector
}) => {
  const { t } = useTranslation();

  const filteredExercises = exercises.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedExercise = exercises.find(e => e.id === selectedExerciseId);

  return (
    <>
      {/* Mobile Toggle for Exercise Selector */}
      <div className="lg:hidden mb-2">
        <button
          onClick={() => setShowMobileSelector(!showMobileSelector)}
          className="w-full flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-2xl shadow-sm font-bold text-zinc-900"
        >
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-indigo-600" />
            <span>{selectedExercise ? selectedExercise.name : t('workout.progress.all_history')}</span>
          </div>
          <Search className="w-4 h-4 text-zinc-400" />
        </button>
      </div>

      {/* Sidebar: Exercise Selector */}
      <div className={`lg:col-span-1 space-y-4 ${showMobileSelector ? 'block' : 'hidden lg:block'}`}>
        <button
          onClick={() => onSelectExercise(null)}
          className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3 shadow-sm ${
            !selectedExerciseId 
              ? 'bg-zinc-900 border-zinc-900 text-white' 
              : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
          }`}
        >
          <HistoryIcon className={`w-5 h-5 ${!selectedExerciseId ? 'text-white' : 'text-zinc-400'}`} />
          <span className="font-bold">{t('workout.progress.all_history')}</span>
        </button>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <input 
            id="exercise-search"
            type="text"
            placeholder={t('workout.progress.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
          />
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm max-h-[50vh] overflow-y-auto">
          {loading ? (
             <div className="p-8 flex justify-center">
               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
             </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {filteredExercises.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => onSelectExercise(ex.id || null)}
                  className={`w-full text-left p-4 hover:bg-zinc-50 transition-colors flex items-center gap-3 ${
                    selectedExerciseId === ex.id ? 'bg-indigo-50 text-indigo-700' : 'text-zinc-600'
                  }`}
                >
                  <div className="bg-zinc-100 p-2 rounded-lg shrink-0">
                    <Dumbbell className={`w-4 h-4 ${selectedExerciseId === ex.id ? 'text-indigo-600' : 'text-zinc-400'}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold break-words leading-tight">{ex.name}</div>
                    <div className="text-[10px] uppercase tracking-wider text-zinc-400 mt-0.5">{ex.category}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
