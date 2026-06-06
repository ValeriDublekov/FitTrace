import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Exercise, LoadType } from '../../../types';
import { Save, X, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageUploader } from './ImageUploader';

interface ExerciseFormProps {
  exercise?: Exercise;
  defaultCategory?: string;
  onSubmit: (data: Omit<Exercise, 'id' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
  uploadThumbnail: (file: File) => Promise<string>;
}

const CATEGORIES = ['Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Core', 'Cardio', 'Full Body'];
const LOAD_TYPES: LoadType[] = ['WEIGHT_REPS', 'LEVEL_REPS', 'CARDIO'];

export const ExerciseForm: React.FC<ExerciseFormProps> = ({ 
  exercise, 
  defaultCategory,
  onSubmit, 
  onCancel,
  uploadThumbnail 
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState(exercise?.name || '');
  const [category, setCategory] = useState(exercise?.category || defaultCategory || CATEGORIES[0]);
  const [loadType, setLoadType] = useState<LoadType>(exercise?.loadType || 'WEIGHT_REPS');
  const [url, setUrl] = useState(exercise?.url || '');
  const [notes, setNotes] = useState(exercise?.defaultNotes || '');
  const [description, setDescription] = useState(exercise?.description || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(exercise?.thumbnailUrl || '');
  const [affectedPart, setAffectedPart] = useState(exercise?.affectedPart || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        category,
        loadType,
        defaultNotes: notes,
        description,
        url,
        thumbnailUrl,
        affectedPart
      });
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8"
      id="exercise-form-container"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          {exercise ? t('workout.exercise_form.title_edit') : t('workout.exercise_form.title_create')}
        </h3>
        <button 
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          id="btn-cancel-form"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <ImageUploader 
            url={thumbnailUrl}
            isUploading={isUploading}
            onUrlChange={setThumbnailUrl}
            onUploadStart={() => setIsUploading(true)}
            onUploadEnd={() => setIsUploading(false)}
            uploadThumbnail={uploadThumbnail}
          />

          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('workout.exercise_form.name')}</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bench Press"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('workout.exercise_form.affected_part')}</label>
              <input 
                type="text"
                value={affectedPart}
                onChange={(e) => setAffectedPart(e.target.value)}
                placeholder="e.g. Upper Chest / Anterior Deltoid"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('workout.exercise_form.category')}</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{t(`workout.categories.${c.toLowerCase().replace(' ', '_')}`)}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('workout.exercise_form.load_type')}</label>
                <select 
                  value={loadType}
                  onChange={(e) => setLoadType(e.target.value as LoadType)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                >
                  {LOAD_TYPES.map(tOption => <option key={tOption} value={tOption}>{t(`workout.load_types.${tOption.toLowerCase()}`)}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL (Optional)</label>
          <input 
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('workout.exercise_form.notes')}</label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Technical tips or default notes..."
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('workout.exercise_form.description')}</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Detailed execution tips, proper technique, common mistakes to avoid (AI generated advice format)..."
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button 
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-bold text-sm"
          >
            {t('workout.exercise_form.cancel')}
          </button>
          <button 
            type="submit"
            disabled={isSubmitting || isUploading}
            className="flex items-center gap-2 px-8 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-sm"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {exercise ? t('workout.exercise_form.save') : t('common.save')}
          </button>
        </div>
      </form>
    </motion.div>
  );
};
