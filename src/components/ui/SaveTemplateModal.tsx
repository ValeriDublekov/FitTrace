import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Search, Check, Dumbbell } from 'lucide-react';
import { useExercises } from '../../hooks/useExercises';

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialExerciseIds?: string[];
  initialName?: string;
  onSave: (name: string, exerciseIds: string[]) => Promise<void>;
}

export const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({
  isOpen,
  onClose,
  initialExerciseIds = [],
  initialName = '',
  onSave
}) => {
  const { t } = useTranslation();
  const { exercises, loading } = useExercises();
  const [name, setName] = useState(initialName);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialExerciseIds);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => 
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [exercises, searchQuery]);

  if (!isOpen) return null;

  const handleToggleExercise = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleConfirmSave = async () => {
    if (!name.trim()) {
      setError(t('exercise_form.name') + ' is required');
      return;
    }
    if (selectedIds.length === 0) {
      setError(t('workout.pick_exercise'));
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(name.trim(), selectedIds);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error saving template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 flex justify-between items-center bg-white">
          <h2 className="font-black text-xl text-zinc-900 tracking-tight">
            {initialExerciseIds.length > 0 
              ? t('workout.templates.save_from_history')
              : t('workout.templates.dialog_create_title')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-xl transition-all">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {/* Name input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              {t('workout.templates.name_label')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder={t('workout.templates.name_placeholder')}
              className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold"
              id="template-name-input"
            />
          </div>

          {/* Exercises Selection */}
          <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              {t('workout.templates.exercises_label')}
            </label>

            <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-2xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
              <Search className="text-zinc-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t('workout.progress.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none p-0 text-sm focus:ring-0 w-full"
              />
            </div>

            {loading ? (
              <div className="py-8 flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="space-y-2 mt-3 overflow-y-auto max-h-[30vh] pr-1">
                {filteredExercises.map(ex => {
                  const isChecked = selectedIds.includes(ex.id!);
                  return (
                    <button
                      key={ex.id}
                      onClick={() => handleToggleExercise(ex.id!)}
                      className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-left transition-all ${
                        isChecked 
                          ? 'border-indigo-600 bg-indigo-50/40' 
                          : 'border-zinc-200 bg-white hover:bg-zinc-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Dumbbell className={`w-4 h-4 ${isChecked ? 'text-indigo-600' : 'text-zinc-400'}`} />
                        <div>
                          <p className="font-bold text-zinc-900 text-sm">{ex.name}</p>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{ex.category}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-zinc-300'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white border border-zinc-200 text-zinc-700 font-bold rounded-2xl text-sm hover:bg-zinc-100 transition-all"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleConfirmSave}
            disabled={saving}
            className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-2xl text-sm hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {saving ? t('common.loading') : t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
};
