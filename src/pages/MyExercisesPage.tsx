import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useExercises } from '../hooks/useExercises';
import { ExerciseForm } from '../features/admin/components/ExerciseForm';
import { Exercise } from '../types';
import { Plus, Edit3, Trash2, Search, Filter, User, Dumbbell, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { getCategoryColorScheme, getZoneColorScheme, sortExercises } from '../utils/colorUtils';

const MyExercisesPage: React.FC = () => {
  const { t } = useTranslation();
  const { exercises, loading, error, addExercise, updateExercise, deleteExercise, uploadThumbnail } = useExercises({ adminMode: false });
  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Modal state
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);

  // We only care about custom ones here
  const customExercises = exercises.filter(e => e.isCustom);
  const categories = ['All', ...Array.from(new Set(customExercises.map(e => e.category)))];

  const filteredExercises = sortExercises<Exercise>(
    customExercises.filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
  );

  const handleDeleteClick = (exercise: Exercise) => {
    setExerciseToDelete(exercise);
  };

  const confirmDelete = async () => {
    if (exerciseToDelete?.id) {
      await deleteExercise(exerciseToDelete.id);
      setExerciseToDelete(null);
    }
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setShowForm(true);
  };

  const handleCreateNew = () => {
    setEditingExercise(undefined);
    setShowForm(true);
  };

  const handleSubmit = async (data: Omit<Exercise, 'id' | 'createdAt'>) => {
    if (editingExercise?.id) {
      await updateExercise(editingExercise.id, data);
    } else {
      await addExercise(data);
    }
    setShowForm(false);
    setEditingExercise(undefined);
  };

  if (loading && exercises.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8" id="my-exercises-page-root">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <User className="w-8 h-8 text-amber-500" />
            {t('workout.my_exercises.title')}
          </h1>
          <p className="text-gray-500 mt-1">{t('workout.my_exercises.description')}</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-100 hover:bg-amber-600 transition-all font-bold"
          id="btn-add-custom-exercise"
        >
          <Plus className="w-5 h-5" />
          {t('workout.my_exercises.create_new')}
        </button>
      </header>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-2xl max-h-[95vh] overflow-y-auto">
              <ExerciseForm 
                exercise={editingExercise}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingExercise(undefined);
                }}
                uploadThumbnail={uploadThumbnail}
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" id="custom-exercise-list-container">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 bg-gray-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder={t('workout.my_exercises.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
              id="search-custom-exercises"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all text-sm font-medium"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-gray-100">
          {filteredExercises.length > 0 ? (
            filteredExercises.map((exercise) => (
              <motion.div 
                layout
                key={exercise.id}
                className="p-4 flex items-center gap-4 hover:bg-amber-50/30 transition-colors group"
              >
                <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                  {exercise.thumbnailUrl ? (
                    <img 
                      src={exercise.thumbnailUrl} 
                      alt={exercise.name} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Dumbbell className="w-6 h-6" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 break-words leading-tight">{exercise.name}</h4>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-1.5 align-middle">
                    {(() => {
                      const catColors = getCategoryColorScheme(exercise.category);
                      return (
                        <span className={`px-2.5 py-0.5 border rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${catColors.bg} ${catColors.text} ${catColors.border}`}>
                          {t(`workout.categories.${exercise.category.toLowerCase().replace(' ', '_')}`, exercise.category)}
                        </span>
                      );
                    })()}
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-gray-100 px-2 py-0.5 border border-gray-200 rounded animate-none">
                      {t(`workout.load_types.${exercise.loadType.toLowerCase()}`, exercise.loadType.replace('_', ' '))}
                    </span>
                    {exercise.affectedPart && (() => {
                      const zoneColors = getZoneColorScheme(exercise.affectedPart);
                      return (
                        <span className={`text-xs font-bold px-2 py-0.5 border rounded-lg flex items-center gap-1 uppercase tracking-wider transition-colors ${zoneColors.bg} ${zoneColors.text} ${zoneColors.border}`}>
                          <Target className="w-3.5 h-3.5 shrink-0 animate-none" />
                          {exercise.affectedPart}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(exercise)}
                    className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                    title="Edit"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(exercise)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500">{t('workout.my_exercises.no_exercises')}</p>
              <button 
                onClick={handleCreateNew}
                className="mt-4 text-amber-600 font-bold hover:underline"
              >
                {t('workout.my_exercises.create_first')}
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={exerciseToDelete !== null}
        title="Delete Exercise"
        message={`Are you sure you want to delete "${exerciseToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setExerciseToDelete(null)}
      />
    </div>
  );
};

export default MyExercisesPage;
