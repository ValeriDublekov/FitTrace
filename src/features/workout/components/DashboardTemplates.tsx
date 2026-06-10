import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, PlusCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useWorkoutTemplates } from '../../../hooks/useWorkoutTemplates';
import { useExercises } from '../../../hooks/useExercises';
import { useWorkoutContext } from '../context/WorkoutSessionContext';
import { SaveTemplateModal } from '../../../components/ui/SaveTemplateModal';
import { TemplateDetailsModal } from '../../../components/ui/TemplateDetailsModal';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { WorkoutTemplate } from '../../../types';

export const DashboardTemplates: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { templates, loading: templatesLoading, addTemplate, updateTemplate, deleteTemplate } = useWorkoutTemplates();
  const { exercises } = useExercises();
  const { startWorkoutFromTemplate } = useWorkoutContext();

  const [activeModal, setActiveModal] = useState<'NONE' | 'CREATE' | 'EDIT' | 'DETAILS'>('NONE');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleCreateTemplate = async (name: string, exerciseIds: string[]) => {
    await addTemplate(name, exerciseIds);
    setActiveModal('NONE');
  };

  const handleEditTemplate = async (name: string, exerciseIds: string[]) => {
    if (!selectedTemplate?.id) return;
    await updateTemplate(selectedTemplate.id, { name, exerciseIds });
    setActiveModal('NONE');
  };

  const handleStartWorkout = async (mode: 'LIVE' | 'MANUAL') => {
    if (!selectedTemplate) return;
    
    const templateExercises = selectedTemplate.exerciseIds
      .map(id => exercises.find(ex => ex.id === id))
      .filter((ex): ex is typeof exercises[0] => !!ex);

    await startWorkoutFromTemplate(templateExercises, mode);
    setActiveModal('NONE');
    navigate(mode === 'MANUAL' ? '/new-workout?mode=manual' : '/new-workout');
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;
    await deleteTemplate(confirmDeleteId);
    setConfirmDeleteId(null);
    setActiveModal('NONE');
  };

  if (templatesLoading) {
    return (
      <div className="p-8 flex justify-center bg-white border border-zinc-200 rounded-3xl shadow-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            {t('workout.templates.title')}
          </h2>
          <p className="text-zinc-500 text-xs mt-0.5">{t('workout.templates.subtitle')}</p>
        </div>
        
        <button
          onClick={() => {
            setSelectedTemplate(null);
            setActiveModal('CREATE');
          }}
          className="flex items-center gap-1.5 py-2 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl font-black text-xs transition-all shadow-xs"
        >
          <PlusCircle size={14} />
          {t('common.edit') === 'Редактирай' ? 'Нов' : 'New'}
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="p-8 bg-zinc-50 rounded-3xl border border-zinc-200 border-dashed text-center space-y-3">
          <div className="w-12 h-12 bg-zinc-150 rounded-2xl flex items-center justify-center mx-auto">
            <Dumbbell className="w-6 h-6 text-zinc-400" />
          </div>
          <p className="text-sm font-black text-zinc-800 tracking-tight">{t('workout.templates.empty_state')}</p>
          <p className="text-zinc-400 text-xs max-w-sm mx-auto leading-relaxed">{t('workout.templates.empty_state_desc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {templates.map((tmpl) => {
            // Resolve names of first couple of exercises
            const resolvedNames = tmpl.exerciseIds
              .map(id => exercises.find(ex => ex.id === id)?.name)
              .filter((name): name is string => !!name);

            return (
              <motion.button
                key={tmpl.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  setSelectedTemplate(tmpl);
                  setActiveModal('DETAILS');
                }}
                className="p-5 bg-white border border-zinc-200 rounded-3xl hover:border-indigo-500 hover:shadow-md transition-all text-left flex flex-col justify-between gap-4 h-full group"
              >
                <div className="space-y-1 w-full">
                  <h3 className="font-bold text-zinc-900 leading-snug group-hover:text-indigo-600 transition-colors uppercase text-sm">
                    {tmpl.name}
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    {tmpl.exerciseIds.length} {tmpl.exerciseIds.length === 1 ? 'exercise' : 'exercises'}
                  </p>
                  
                  {resolvedNames.length > 0 && (
                    <p className="text-xs text-zinc-500 mt-2 font-medium line-clamp-2 leading-relaxed">
                      {resolvedNames.join(', ')}
                    </p>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* SaveTemplateModal for creation */}
      {activeModal === 'CREATE' && (
        <SaveTemplateModal
          isOpen={true}
          onClose={() => setActiveModal('NONE')}
          onSave={handleCreateTemplate}
        />
      )}

      {/* SaveTemplateModal for editing */}
      {activeModal === 'EDIT' && selectedTemplate && (
        <SaveTemplateModal
          isOpen={true}
          onClose={() => setActiveModal('NONE')}
          initialName={selectedTemplate.name}
          initialExerciseIds={selectedTemplate.exerciseIds}
          onSave={handleEditTemplate}
        />
      )}

      {/* Details modal */}
      {activeModal === 'DETAILS' && selectedTemplate && (
        <TemplateDetailsModal
          isOpen={true}
          onClose={() => setActiveModal('NONE')}
          template={selectedTemplate}
          exercises={exercises}
          onStart={handleStartWorkout}
          onEdit={() => setActiveModal('EDIT')}
          onDelete={() => {
            setConfirmDeleteId(selectedTemplate.id!);
          }}
        />
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={confirmDeleteId !== null}
        title={t('workout.templates.delete_confirm_title')}
        message={t('workout.templates.delete_confirm_msg')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDeleteId(null)}
        variant="danger"
      />
    </div>
  );
};
