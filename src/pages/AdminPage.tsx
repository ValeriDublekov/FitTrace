import React, { useState } from 'react';
import { useExercises } from '../hooks/useExercises';
import { useAppSettings } from '../hooks/useAppSettings';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { ExerciseForm } from '../features/admin/components/ExerciseForm';
import { CustomExerciseMigration } from '../features/admin/components/CustomExerciseMigration';
import { Exercise } from '../types';
import { Plus, Edit3, Trash2, Search, Filter, Dumbbell, Globe, ShieldAlert, Lock, Unlock, History, Download, Upload, CheckCircle2, AlertCircle, ArrowUpDown, FileSpreadsheet, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { getCategoryColorScheme, getZoneColorScheme, sortExercises } from '../utils/colorUtils';
import { getErrorMessage } from '../utils/errorUtils';

interface ColumnOption {
  id: 'category' | 'id' | 'name' | 'description' | 'affectedPart';
  labelBg: string;
  labelEn: string;
  csvHeader: string;
}

const AVAILABLE_COLUMNS: ColumnOption[] = [
  { id: 'category', labelBg: 'Мускулна група (Категория)', labelEn: 'Muscle Group (Category)', csvHeader: 'мускулна група' },
  { id: 'id', labelBg: 'Идентификатор (ID)', labelEn: 'Identifier (ID)', csvHeader: 'id' },
  { id: 'name', labelBg: 'Име', labelEn: 'Name', csvHeader: 'name' },
  { id: 'description', labelBg: 'Описание', labelEn: 'Description', csvHeader: 'описание' },
  { id: 'affectedPart', labelBg: 'Засегната част', labelEn: 'Affected Part', csvHeader: 'засегната част' }
];

const AdminPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { exercises, loading: exercisesLoading, error, addExercise, updateExercise, deleteExercise, uploadThumbnail, mergeCustomExercise } = useExercises({ adminMode: true });
  const { exercises: userExercises } = useExercises({ adminMode: false });
  const { settings, loading: settingsLoading, updateSettings } = useAppSettings();
  
  const [activeTab, setActiveTab] = useState<'settings' | 'exercises' | 'migration' | 'import_export'>('settings');
  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // CSV Import/Export States
  const [includeCustomExercises, setIncludeCustomExercises] = useState(false);
  const [exportColumns, setExportColumns] = useState<string[]>(['category', 'id', 'name', 'description', 'affectedPart']);
  const [importColumns, setImportColumns] = useState<string[]>(['category', 'id', 'name', 'description', 'affectedPart']);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    success: number;
    errors: number;
    total: number;
    details: string[];
  } | null>(null);
  
  // Modal state
  const [exerciseToDelete, setExerciseToDelete] = useState<string | null>(null);

  const loading = exercisesLoading || settingsLoading;

  const categories = ['All', ...Array.from(new Set(exercises.map(e => e.category)))];

  // We only care about global ones here (not custom)
  const globalExercises = exercises.filter(e => !e.isCustom);
  const customExercises = userExercises.filter(e => e.isCustom && e.userId === user?.uid);

  const filteredExercises = sortExercises<Exercise>(
    globalExercises.filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
  );

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

  const handleExport = () => {
    // Determine which exercises to export
    const listToExport = includeCustomExercises 
      ? [...globalExercises, ...customExercises]
      : globalExercises;
      
    if (exportColumns.length === 0) return;
      
    let csvContent = '\uFEFF'; // UTF-8 BOM so Excel/Cyrillic renders perfectly
    
    // Get active headers based on user selection
    const activeHeaders = AVAILABLE_COLUMNS
      .filter(col => exportColumns.includes(col.id))
      .map(col => col.csvHeader);
      
    csvContent += activeHeaders.join(';') + '\n';
    
    const escapeCSVField = (field: string | undefined | null): string => {
      if (field === undefined || field === null) return '';
      const str = String(field);
      const needsEscaping = str.includes(';') || str.includes('"') || str.includes('\n') || str.includes('\r');
      if (needsEscaping) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    listToExport.forEach(e => {
      const row: string[] = [];
      AVAILABLE_COLUMNS.forEach(col => {
        if (exportColumns.includes(col.id)) {
          let val = '';
          if (col.id === 'category') val = e.category || '';
          else if (col.id === 'id') val = e.id || '';
          else if (col.id === 'name') val = e.name || '';
          else if (col.id === 'description') val = e.description || '';
          else if (col.id === 'affectedPart') val = e.affectedPart || '';
          row.push(escapeCSVField(val));
        }
      });
      csvContent += row.join(';') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `exercises_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (text: string): string[][] => {
    const lines: string[][] = [];
    let row: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (inQuotes) {
        if (char === '"') {
          if (nextChar === '"') {
            currentField += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          currentField += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ';') {
          row.push(currentField);
          currentField = '';
        } else if (char === '\n' || char === '\r') {
          row.push(currentField);
          if (row.length > 1 || row[0] !== '') {
            lines.push(row);
          }
          row = [];
          currentField = '';
          if (char === '\r' && nextChar === '\n') {
            i++;
          }
        } else {
          currentField += char;
        }
      }
    }

    if (row.length > 0 || currentField !== '') {
      row.push(currentField);
      lines.push(row);
    }

    return lines;
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportStatus(null);
    
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        if (!text) {
          setImporting(false);
          return;
        }

        const rows = parseCSV(text);
        if (rows.length === 0) {
          setImporting(false);
          return;
        }

        const firstCol = rows[0]?.[0]?.trim().toLowerCase();
        const startIndex = (firstCol === 'id' || firstCol === 'мускулна група' || firstCol === 'category') ? 1 : 0;
        
        let successCount = 0;
        let errorCount = 0;
        const detailsLog: string[] = [];

        // Identify the indices of columns based on headers if we have them
        const headers = rows[0]?.map(h => h.trim().toLowerCase()) || [];
        
        let idIndex = -1;
        let categoryIndex = -1;
        let nameIndex = -1;
        let descIndex = -1;
        let affectedIndex = -1;

        if (startIndex === 1) {
          idIndex = headers.indexOf('id');
          categoryIndex = headers.indexOf('мускулна група');
          if (categoryIndex === -1) categoryIndex = headers.indexOf('category');
          if (categoryIndex === -1) categoryIndex = headers.indexOf('категория');
          
          nameIndex = headers.indexOf('name');
          if (nameIndex === -1) nameIndex = headers.indexOf('име');
          
          descIndex = headers.indexOf('описание');
          if (descIndex === -1) descIndex = headers.indexOf('description');
          
          affectedIndex = headers.indexOf('засегната част');
          if (affectedIndex === -1) affectedIndex = headers.indexOf('affected part');
          if (affectedIndex === -1) affectedIndex = headers.indexOf('affectedpart');
        }

        // Fallback for older export formats or missing headers
        if (idIndex === -1) {
          if (startIndex === 1) {
            const firstHeader = rows[0]?.[0]?.trim().toLowerCase();
            const isFiveCol = firstHeader === 'мускулна група' || firstHeader === 'category' || rows[0].length >= 5;
            if (isFiveCol) {
              idIndex = 1;
              categoryIndex = 0;
              nameIndex = 2;
              descIndex = 3;
              affectedIndex = rows[0].length >= 5 ? 4 : -1;
            } else {
              idIndex = 0;
              nameIndex = 1;
              descIndex = 2;
            }
          } else {
            // Raw headerless format
            idIndex = 0;
            nameIndex = 1;
            descIndex = 2;
          }
        }

        // Verify ID column is present and user requested importing id
        if (idIndex === -1 || !importColumns.includes('id')) {
          setImportStatus({
            success: 0,
            errors: 1,
            total: 1,
            details: [`Грешка: ИД (id) колоната е задължителна за импорта.`]
          });
          setImporting(false);
          return;
        }

        for (let i = startIndex; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length < 2) continue;

          let id = idIndex !== -1 && idIndex < row.length ? row[idIndex]?.trim() : '';

          if (!id) {
            errorCount++;
            detailsLog.push(`Ред ${i + 1}: Липсва ИД.`);
            continue;
          }

          const existingEx = [...globalExercises, ...customExercises].find(ex => ex.id === id);
          if (!existingEx) {
            errorCount++;
            detailsLog.push(`Ред ${i + 1}: Упражнение с ИД "${id}" не е намерено.`);
            continue;
          }

          // Build dynamic update payload based ONLY on matching importColumns
          const updateData: Partial<Exercise> = {};
          let hasUpdatedFields = false;

          if (importColumns.includes('name') && nameIndex !== -1 && nameIndex < row.length) {
            const val = row[nameIndex]?.trim();
            if (val) {
              updateData.name = val;
              hasUpdatedFields = true;
            }
          }

          if (importColumns.includes('description') && descIndex !== -1 && descIndex < row.length) {
            updateData.description = row[descIndex]?.trim() || '';
            hasUpdatedFields = true;
          }

          if (importColumns.includes('category') && categoryIndex !== -1 && categoryIndex < row.length) {
            const val = row[categoryIndex]?.trim();
            if (val) {
              updateData.category = val;
              hasUpdatedFields = true;
            }
          }

          if (importColumns.includes('affectedPart') && affectedIndex !== -1 && affectedIndex < row.length) {
            updateData.affectedPart = row[affectedIndex]?.trim() || '';
            hasUpdatedFields = true;
          }

          if (!hasUpdatedFields) {
            errorCount++;
            detailsLog.push(`Ред ${i + 1} (ИД: ${id}): Няма колони за актуализиране (всички съвпадащие колони за импорт липсват в CSV или са празни).`);
            continue;
          }

          try {
            await updateExercise(id, updateData);
            successCount++;
            detailsLog.push(`Ред ${i + 1}: Успешно обновено "${updateData.name || existingEx.name}" (ИД: ${id}).`);
          } catch (err: unknown) {
            errorCount++;
            const errMsg = getErrorMessage(err);
            detailsLog.push(`Ред ${i + 1}: Грешка при запис във Firestore за "${updateData.name || existingEx.name}". ${errMsg}`);
          }
        }

        setImportStatus({
          success: successCount,
          errors: errorCount,
          total: rows.length - startIndex,
          details: detailsLog
        });
        setImporting(false);
        setImportFile(null);
      };

      reader.readAsText(importFile, 'UTF-8');
    } catch (err) {
      console.error(err);
      setImporting(false);
    }
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
    { id: 'import_export' as const, label: t('workout.admin.tabs.import_export'), icon: ArrowUpDown },
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

              {/* System Information Section */}
              <div className="mt-12 pt-8 border-t border-gray-100" id="admin-system-info">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                  {t('workout.admin.settings.system_info_title')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                      {t('workout.admin.settings.version')}
                    </p>
                    <p className="text-xl font-mono font-bold text-blue-600">
                      v{__APP_VERSION__}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                      {t('workout.admin.settings.deployed_at')}
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      {new Date(__BUILD_TIME__).toLocaleString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
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

          {activeTab === 'import_export' && (
            <section className="space-y-6" id="admin-import-export-section">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('workout.admin.import_export.title')}</h2>
                <p className="text-gray-500 text-sm">{t('workout.admin.import_export.subtitle')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Export Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                      <Download className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{t('workout.admin.import_export.export_card')}</h3>
                      <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                        {t('workout.admin.import_export.export_desc')}
                      </p>
                    </div>

                    <label className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-100/50 transition-all select-none col-span-2">
                      <input 
                        type="checkbox" 
                        checked={includeCustomExercises} 
                        onChange={(e) => setIncludeCustomExercises(e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                      />
                      <span className="text-sm text-gray-600 font-medium">
                        {t('workout.admin.import_export.include_custom')}
                      </span>
                    </label>

                    {/* Export Columns Selection */}
                    <div className="space-y-2">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest block">
                        {i18n.language === 'bg' ? 'Колони за експортиране' : 'Columns to Export'}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        {AVAILABLE_COLUMNS.map(col => (
                          <label key={col.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                            <input 
                              type="checkbox"
                              checked={exportColumns.includes(col.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setExportColumns([...exportColumns, col.id]);
                                } else {
                                  setExportColumns(exportColumns.filter(id => id !== col.id));
                                }
                              }}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>{i18n.language === 'bg' ? col.labelBg : col.labelEn}</span>
                          </label>
                        ))}
                      </div>
                      {exportColumns.length === 0 && (
                        <span className="text-xs text-rose-500 block">
                          {i18n.language === 'bg' ? 'Моля, изберете поне една колона за експортиране.' : 'Please select at least one column to export.'}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleExport}
                    disabled={exportColumns.length === 0}
                    className={`w-full py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 cursor-pointer ${exportColumns.length === 0 ? 'opacity-50 cursor-not-allowed font-medium' : ''}`}
                  >
                    <Download className="w-4 h-4" />
                    {t('workout.admin.import_export.export_btn')}
                  </button>
                </div>

                {/* Import Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{t('workout.admin.import_export.import_card')}</h3>
                      <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                        {t('workout.admin.import_export.import_desc')}
                      </p>
                    </div>

                    {/* Import Columns Selection */}
                    <div className="space-y-2">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest block">
                        {i18n.language === 'bg' ? 'Колони за импортиране (ИД е задължително)' : 'Columns to Import (ID is mandatory)'}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        {AVAILABLE_COLUMNS.map(col => {
                          const isId = col.id === 'id';
                          return (
                            <label 
                              key={col.id} 
                              className={`flex items-center gap-2 text-sm select-none ${isId ? 'text-gray-400 cursor-not-allowed font-medium' : 'text-gray-700 cursor-pointer'}`}
                            >
                              <input 
                                type="checkbox"
                                checked={isId || importColumns.includes(col.id)}
                                disabled={isId}
                                onChange={(e) => {
                                  if (isId) return;
                                  if (e.target.checked) {
                                    setImportColumns([...importColumns, col.id]);
                                  } else {
                                    setImportColumns(importColumns.filter(id => id !== col.id));
                                  }
                                }}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                              />
                              <span>
                                {i18n.language === 'bg' ? col.labelBg : col.labelEn}
                                {isId && ' *'}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Drag and Drop File Input Area */}
                    <div 
                      className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${importFile ? 'border-indigo-500 bg-indigo-50/25' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100/50'}`}
                      onClick={() => document.getElementById('csv-import-file')?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
                          setImportFile(file);
                        }
                      }}
                    >
                      <input 
                        type="file" 
                        id="csv-import-file" 
                        accept=".csv"
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setImportFile(file);
                        }}
                      />
                      <FileSpreadsheet className={`w-8 h-8 mb-2 ${importFile ? 'text-indigo-600' : 'text-gray-400'}`} />
                      <span className="text-sm font-bold text-gray-700">
                        {importFile ? importFile.name : t('workout.admin.import_export.upload_or_drag')}
                      </span>
                      {importFile && (
                        <span className="text-xs text-gray-400 mt-1">
                          {(importFile.size / 1024).toFixed(1)} KB
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleImport}
                    disabled={importing || !importFile || importColumns.length === 0}
                    className={`w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 ${importing || !importFile || importColumns.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {importing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {t('workout.admin.import_export.import_btn')}
                  </button>
                </div>
              </div>

              {/* Import status and logs console */}
              {importStatus && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-4">
                  <div className="flex items-center gap-2 text-gray-900">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    <h3 className="text-xl font-bold">{t('workout.admin.import_export.status_label')}</h3>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 text-center">
                      <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest block">{t('workout.admin.import_export.status_updated')}</span>
                      <span className="text-2xl font-black text-emerald-950">{importStatus.success}</span>
                    </div>
                    <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 text-center">
                      <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest block">{t('workout.admin.import_export.status_errors')}</span>
                      <span className="text-2xl font-black text-rose-950">{importStatus.errors}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                      <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest block">{t('workout.admin.import_export.status_total')}</span>
                      <span className="text-2xl font-black text-slate-950">{importStatus.total}</span>
                    </div>
                  </div>

                  {importStatus.details.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest block">Детайлен лог на процеса</span>
                      <div className="bg-zinc-950 text-zinc-300 font-mono text-[11px] rounded-2xl p-6 h-60 overflow-y-auto space-y-1.5 scrollbar-thin">
                        {importStatus.details.map((log, idx) => (
                          <div 
                            key={idx} 
                            className={log.includes('Успешно') ? 'text-emerald-400' : log.includes('Грешка') || log.includes('не е намерено') ? 'text-rose-450' : 'text-zinc-400'}
                          >
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdminPage;
