import { useAppData } from '../context/AppDataContext';

export const useUserSettings = () => {
  const {
    state,
    updateFontSize,
    updateLanguage,
    updateNotificationSound,
    updateIsNotificationsEnabled,
  } = useAppData();

  return {
    settings: state.userSettings,
    loading: state.loading.userSettings,
    updateFontSize,
    updateLanguage,
    updateNotificationSound,
    updateIsNotificationsEnabled,
  };
};
