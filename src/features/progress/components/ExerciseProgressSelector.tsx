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
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  sortBy: 'participation' | 'name' | 'recent';
  setSortBy: (sort: 'participation' | 'name' | 'recent') => void;
  exerciseStats: { counts: Record<string, number>; lastDates: Record<string, number> };
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
  categoryFilter,
  setCategoryFilter,
  sortBy,
  setSortBy,
  exerciseStats,
  onSelectExercise,
  showMobileSelector,
  setShowMobileSelector
}) => {
  const { t } = useTranslation();

  const categories = Array.from(new Set(exercises.map(ex => ex.category)));

  const filteredAndSortedExercises = exercises
    .filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const idA = a.id || '';
      const idB = b.id || '';
      
      if (sortBy === 'participation') {
        const countA = exerciseStats.counts[idA] || 0;
        const countB = exerciseStats.counts[idB] || 0;
        if (countB !== countA) return countB - countA;
        return a.name.localeCompare(b.name);
      }
      
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      
      if (sortBy === 'recent') {
        const dateA = exerciseStats.lastDates[idA] || 0;
        const dateB = exerciseStats.lastDates[idB] || 0;
        if (dateB !== dateA) return dateB - dateA;
        return a.name.localeCompare(b.name);
      }
      
      return 0;
    });

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

        {/* Filters & Sorting */}
        <div className="space-y-3 p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5 ml-1">
              {t('workout.progress.filter_category')}
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
            >
              <option value="all">{t('workout.progress.all_categories')}</option>
              {categories.map((cat: string) => (
                <option key={cat} value={cat}>{t(`workout.categories.${cat.toLowerCase()}` as any, cat)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5 ml-1">
              {t('workout.progress.sort_by')}
            </label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'participation', label: t('workout.progress.sort_options.participation') },
                { id: 'name', label: t('workout.progress.sort_options.name') },
                { id: 'recent', label: t('workout.progress.sort_options.recent') }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSortBy(opt.id as any)}
                  className={`py-1.5 px-1 rounded-lg text-[10px] font-black uppercase transition-all border ${
                    sortBy === opt.id 
                      ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm' 
                      : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm max-h-[50vh] overflow-y-auto">
          {loading ? (
             <div className="p-8 flex justify-center">
               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
             </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {filteredAndSortedExercises.map((ex) => (
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
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-bold break-words leading-tight">{ex.name}</div>
                      <div className="bg-zinc-100 text-zinc-500 text-[10px] font-black px-1.5 py-0.5 rounded-md self-start shrink-0">
                        {exerciseStats.counts[ex.id || ''] || 0}
                      </div>
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-zinc-400 mt-0.5">
                      {t(`workout.categories.${ex.category.toLowerCase()}` as any, ex.category)}
                    </div>
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
