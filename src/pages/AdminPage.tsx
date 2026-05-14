import React, { useState } from 'react';
import { useExercises } from '../hooks/useExercises';
import { useAppSettings } from '../hooks/useAppSettings';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { ExerciseForm } from '../features/admin/components/ExerciseForm';
import { CustomExerciseMigration } from '../features/admin/components/CustomExerciseMigration';
import { Exercise } from '../types';
import { Plus, Edit3, Trash2, Search, Filter, Dumbbell, Globe, ShieldAlert, Lock, Unlock, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmModal } from '../components/ui/ConfirmModal';

const AdminPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { exercises, loading: exercisesLoading, error, addExercise, updateExercise, deleteExercise, uploadThumbnail, mergeCustomExercise } = useExercises({ adminMode: true });
  const { settings, loading: settingsLoading, updateSettings } = useAppSettings();
  
  const [activeTab, setActiveTab] = useState<'settings' | 'exercises' | 'migration'>('settings');
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
  const customExercises = exercises.filter(e => e.isCustom && e.userId === user?.uid);

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

  const tabs = [
    { id: 'settings' as const, label: t('workout.admin.tabs.settings'), icon: Globe },
    { id: 'exercises' as const, label: t('workout.admin.tabs.exercises'), icon: Dumbbell },
    { id: 'migration' as const, label: t('workout.admin.tabs.migration'), icon: History },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8" id="admin-page-root">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-blue-600" />
          {t('workout.admin.title')}
        </h1>
        <p className="text-gray-500 mt-1">{t('workout.admin.subtitle')}</p>
      </header>

      {/* Sub-navigation Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 mb-8 bg-gray-100/50 p-1 rounded-2xl border border-gray-200" id="admin-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm border border-gray-100'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'settings' && (
            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8" id="admin-settings-section">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('workout.admin.settings.title')}</h2>
                <p className="text-gray-500 text-sm">{t('workout.admin.settings.subtitle')}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${settings?.isPublic ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                    {settings?.isPublic ? <Unlock className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{t('workout.admin.settings.public_access')}</h3>
                    <p className="text-sm text-gray-600 mt-1 max-w-md">
                      {settings?.isPublic 
                        ? t('workout.admin.settings.public_desc')
                        : t('workout.admin.settings.private_desc')}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => updateSettings({ isPublic: !settings?.isPublic })}
                  className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${
                    settings?.isPublic 
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                      : 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-100'
                  }`}
                  id="toggle-public-access-btn"
                >
                  {settings?.isPublic ? t('workout.admin.settings.make_private') : t('workout.admin.settings.make_public')}
                </button>
              </div>
            </section>
          )}

          {activeTab === 'exercises' && (
            <div className="space-y-6">
              <section className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{t('workout.admin.exercises.title')}</h2>
                  <p className="text-gray-500 text-sm">{t('workout.admin.exercises.subtitle')}</p>
                </div>
                <button 
                  onClick={handleCreateNew}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all font-bold text-sm"
                  id="btn-add-exercise-main"
                >
                  <Plus className="w-4 h-4" />
                  {t('workout.admin.exercises.add_new')}
                </button>
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

              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden" id="exercise-list-container">
                {/* Filters */}
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 bg-gray-50/50">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text"
                      placeholder={t('workout.admin.exercises.search')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                      id="search-exercises-input"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-400" />
                      <select 
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-bold text-gray-700"
                        id="filter-category-select"
                      >
                        {categories.map(c => {
                          const categoryKey = String(c).toLowerCase();
                          return (
                            <option key={String(c)} value={String(c)}>
                              {c === 'All' ? t('workout.titles.exercises') : t(`workout.categories.${categoryKey}`)}
                            </option>
                          );
                        })}
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
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
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
                          <h4 className="font-bold text-gray-900 break-words leading-tight">{exercise.name}</h4>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                              {exercise.category}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded">
                              {exercise.loadType.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(exercise)}
                            className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Edit"
                            id={`btn-edit-${exercise.id}`}
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => exercise.id && handleDeleteClick(exercise.id)}
                            className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete"
                            id={`btn-delete-${exercise.id}`}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-16 text-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="w-10 h-10 text-gray-200" />
                      </div>
                      <p className="text-gray-500 font-medium text-lg">{t('workout.admin.exercises.no_found')}</p>
                      <p className="text-gray-400 text-sm mt-1">{t('workout.admin.exercises.no_found_desc')}</p>
                    </div>
                  )}
                </div>
              </div>

              <ConfirmModal
                isOpen={exerciseToDelete !== null}
                title={t('workout.admin.exercises.delete_confirm_title')}
                message={t('workout.admin.exercises.delete_confirm_msg')}
                confirmLabel={t('workout.admin.exercises.delete_btn')}
                onConfirm={confirmDelete}
                onCancel={() => setExerciseToDelete(null)}
              />
            </div>
          )}

          {activeTab === 'migration' && (
            <section className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('workout.admin.migration.title')}</h2>
                <p className="text-gray-500 text-sm">{t('workout.admin.migration.subtitle')}</p>
              </div>
              <CustomExerciseMigration 
                customExercises={customExercises}
                systemExercises={globalExercises}
                onMerge={mergeCustomExercise}
              />
            </section>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdminPage;
