import { useAppData } from '../context/AppDataContext';

export const useAppSettings = () => {
  const { state, updateAppSettings } = useAppData();
  return {
    settings: state.appSettings,
    loading: state.loading.appSettings,
    updateSettings: updateAppSettings,
  };
};
