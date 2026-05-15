import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useUserSettings } from '../../hooks/useUserSettings';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { Settings, Type, LogOut, User as UserIcon, ChevronDown, Bell } from 'lucide-react';
import { playNotificationSound } from '../../utils/audioUtils';
import { motion, AnimatePresence } from 'motion/react';
import { FontSize } from '../../types';

const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const { settings: userSettings, updateFontSize, updateNotificationSound, updateIsNotificationsEnabled } = useUserSettings();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [availableSounds, setAvailableSounds] = useState<string[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSounds = async () => {
      const baseUrl = import.meta.env.BASE_URL || '/';
      const apiPath = `${baseUrl}api/sounds?t=${Date.now()}`;
      const manifestPath = `${baseUrl}sounds.json?t=${Date.now()}`;
      
      console.log('Fetching sounds from:', { apiPath, manifestPath, baseUrl });
      
      try {
        const apiResponse = await fetch(apiPath);
        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
          if (isMounted) {
            setAvailableSounds(Array.isArray(apiData) ? apiData : []);
            return;
          }
        }
      } catch (apiError) {
        console.warn('API fetch failed:', apiError);
      }

      try {
        const response = await fetch(manifestPath);
        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            setAvailableSounds(Array.isArray(data) ? data : []);
          }
        }
      } catch (error) {
        console.error('Manifest fetch failed:', error);
      }
    };
    fetchSounds();
    return () => { isMounted = false; };
  }, []);

  const formatSoundName = (filename: string) => {
    return filename.replace(/\.(mp3|wav)$/i, '').replace(/[_-]/g, ' ');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fontSizeOptions: { label: string; value: FontSize }[] = [
    { label: t('dashboard.font_sizes.normal'), value: 'normal' },
    { label: t('dashboard.font_sizes.large'), value: 'large' },
    { label: t('dashboard.font_sizes.xlarge'), value: 'xlarge' },
  ];

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 hover:bg-zinc-100 rounded-2xl transition-colors"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-xl object-cover ring-2 ring-white shadow-sm" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <UserIcon className="w-5 h-5" />
          </div>
        )}
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-xl border border-zinc-200 py-3 z-50"
          >
            <div className="px-5 py-3 border-b border-zinc-100 mb-2">
              <p className="font-bold text-zinc-900 truncate">{user.displayName}</p>
              <p className="text-xs text-zinc-500 truncate">{user.email}</p>
            </div>

            <div className="px-4 py-2">
              <div className="flex items-center gap-2 mb-3 text-zinc-400">
                <Type className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{t('dashboard.display_settings')}</span>
              </div>
              <div className="flex p-1 bg-zinc-100 rounded-xl mb-4">
                {fontSizeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateFontSize(option.value)}
                    className={`flex-1 py-2 px-1 rounded-lg text-[10px] font-bold transition-all ${
                      userSettings.fontSize === option.value
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 mb-3 text-zinc-400">
                <Settings className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{t('dashboard.notification_settings')}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={userSettings.isNotificationsEnabled}
                  onChange={(e) => updateIsNotificationsEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs text-zinc-600">{t('dashboard.enable_notifications')}</span>
              </div>
              <div className="flex gap-2 mb-4">
                <select
                  value={userSettings.notificationSound}
                  onChange={(e) => updateNotificationSound(e.target.value)}
                  disabled={!userSettings.isNotificationsEnabled}
                  className="flex-1 text-xs p-2 rounded-lg border border-zinc-200 focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  <option value="default">{t('dashboard.notification_sounds.zen')}</option>
                  {availableSounds.map(sound => (
                    <option key={sound} value={sound}>{formatSoundName(sound)}</option>
                  ))}
                </select>
                <button
                  onClick={() => playNotificationSound(userSettings.notificationSound)}
                  disabled={!userSettings.isNotificationsEnabled}
                  className="px-3 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 disabled:opacity-50"
                >
                  {t('dashboard.preview')}
                </button>
              </div>
            
              <div className="flex items-center gap-2 mb-3 text-zinc-400">
                <Settings className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{t('dashboard.language_settings')}</span>
              </div>
              <div className="mb-4">
                <LanguageSwitcher />
              </div>
            </div>

            <div className="px-2 pt-2 border-t border-zinc-100">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t('navbar.logout')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
