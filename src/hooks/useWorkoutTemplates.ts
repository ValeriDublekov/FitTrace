import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { templateService } from '../services/templateService';
import { WorkoutTemplate } from '../types';

export const useWorkoutTemplates = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    if (!user) {
      setTemplates([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await templateService.getUserTemplates(user.uid);
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const addTemplate = useCallback(async (name: string, exerciseIds: string[]) => {
    if (!user) return;
    try {
      const id = await templateService.saveTemplate({
        userId: user.uid,
        name,
        exerciseIds,
      });
      await fetchTemplates();
      return id;
    } catch (error) {
      console.error('Error adding template:', error);
      throw error;
    }
  }, [user, fetchTemplates]);

  const updateTemplate = useCallback(async (templateId: string, updates: Partial<Omit<WorkoutTemplate, 'id' | 'createdAt'>>) => {
    try {
      await templateService.updateTemplate(templateId, updates);
      await fetchTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  }, [fetchTemplates]);

  const deleteTemplate = useCallback(async (templateId: string) => {
    try {
      await templateService.deleteTemplate(templateId);
      await fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    refreshTemplates: fetchTemplates,
  };
};
