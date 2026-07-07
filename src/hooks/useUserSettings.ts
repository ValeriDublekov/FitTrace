import { useUserSettingsContext } from '../context/AppDataContext';

export const useUserSettings = () => {
  const {
    settings,
    loading,
    updateFontSize,
    updateLanguage,
    updateNotificationSound,
    updateIsNotificationsEnabled,
  } = useUserSettingsContext();

  return {
    settings,
    loading,
    updateFontSize,
    updateLanguage,
    updateNotificationSound,
    updateIsNotificationsEnabled,
  };
};
