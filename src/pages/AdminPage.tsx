import React, { useState } from 'react';
import { useExercises } from '../hooks/useExercises';
import { useAppSettings } from '../hooks/useAppSettings';
import { ExerciseForm } from '../features/admin/components/ExerciseForm';
import { Exercise } from '../types';
import { Plus, Edit3, Trash2, Search, Filter, Dumbbell, Globe, ShieldAlert, Lock, Unlock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmModal } from '../components/ui/ConfirmModal';

const AdminPage: React.FC = () => {
  const { exercises, loading: exercisesLoading, error, addExercise, updateExercise, deleteExercise, uploadThumbnail } = useExercises({ adminMode: true });
  const { settings, loading: settingsLoading, updateSettings } = useAppSettings();
  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Modal state
  const [exerciseToDelete, setExerciseToDelete] = useState<string | null>(null);

  const loading = exercisesLoading || settingsLoading;

  const categories = ['All', ...Array.from(new Set(exercises.map(e => e.category)))];

  // We only care about global ones here (not custom)
  const globalExercises = exercises.filter(e => !e.isCustom);

  const filteredExercises = globalExercises.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteClick = (id: string) => {
    setExerciseToDelete(id);
  };

  const confirmDelete = async () => {
    if (exerciseToDelete) {
      await deleteExercise(exerciseToDelete);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8" id="admin-page-root">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-blue-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Manage application settings and global exercises</p>
        </div>
      </header>

      {/* Global Settings Section */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8" id="admin-settings-section">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-gray-400" />
          General Settings
        </h2>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${settings?.isPublic ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
              {settings?.isPublic ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Public Access</h3>
              <p className="text-sm text-gray-500">
                {settings?.isPublic 
                  ? 'Anyone logged in can use the app.' 
                  : 'Only administrators can access the application. Non-admins will see a maintenance message.'}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => updateSettings({ isPublic: !settings?.isPublic })}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              settings?.isPublic 
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                : 'bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-100'
            }`}
            id="toggle-public-access-btn"
          >
            {settings?.isPublic ? 'Make Private' : 'Make Public'}
          </button>
        </div>
      </section>

      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
             <Dumbbell className="w-5 h-5 text-gray-400" />
             Global Exercises
          </h2>
          <button 
            onClick={handleCreateNew}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all font-medium text-sm"
            id="btn-add-exercise-main"
          >
            <Plus className="w-4 h-4" />
            Add Exercise
          </button>
        </div>
      </section>

      <AnimatePresence>
        {showForm && (
          <ExerciseForm 
            exercise={editingExercise}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
            uploadThumbnail={uploadThumbnail}
          />
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" id="exercise-list-container">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 bg-gray-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              id="search-exercises-input"
            />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium"
                id="filter-category-select"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-gray-100">
          {filteredExercises.length > 0 ? (
            filteredExercises.map((exercise) => (
              <motion.div 
                layout
                key={exercise.id}
                className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors group"
                id={`exercise-item-${exercise.id}`}
              >
                <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                  {exercise.thumbnailUrl ? (
                    <img 
                      src={exercise.thumbnailUrl} 
                      alt={exercise.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Dumbbell className="w-6 h-6" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 break-words leading-tight">{exercise.name}</h4>
                  <div className="flex items-center gap-3 mt-1 [.font-size-large_&]:hidden [.font-size-xlarge_&]:hidden">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                      {exercise.category}
                    </span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">
                      {exercise.loadType.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEdit(exercise)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Edit"
                    id={`btn-edit-${exercise.id}`}
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => exercise.id && handleDeleteClick(exercise.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete"
                    id={`btn-delete-${exercise.id}`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-200" />
              </div>
              <p className="text-gray-500">No official exercises found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={exerciseToDelete !== null}
        title="Delete Exercise"
        message="Are you sure you want to delete this exercise? This action is irreversible and may affect workout history referencing this exercise."
        confirmLabel="Delete Permanently"
        onConfirm={confirmDelete}
        onCancel={() => setExerciseToDelete(null)}
      />
    </div>
  );
};

export default AdminPage;
