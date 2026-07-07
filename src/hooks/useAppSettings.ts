import { useAppSettingsContext } from '../context/AppDataContext';

export const useAppSettings = () => {
  const { settings, loading, updateSettings } = useAppSettingsContext();
  return {
    settings,
    loading,
    updateSettings,
  };
};
