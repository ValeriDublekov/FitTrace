import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { useUserSettings } from '../../hooks/useUserSettings';
import { Language } from '../../types';

const LanguageSwitcher: React.FC<{ variant?: 'minimal' | 'full' }> = ({ variant = 'minimal' }) => {
  const { i18n, t } = useTranslation();
  const { settings, updateLanguage } = useUserSettings();

  const handleLanguageChange = (lang: Language) => {
    i18n.changeLanguage(lang);
    updateLanguage(lang);
  };

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'bg', name: 'Български', flag: '🇧🇬' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  if (variant === 'full') {
    return (
      <div className="space-y-4">
        <p className="text-zinc-700 font-medium text-sm">{t('dashboard.language_settings')}:</p>
        <div className="flex p-1.5 bg-zinc-100 rounded-2xl">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex-1 py-3 px-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                i18n.language === lang.code
                  ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-zinc-200'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            i18n.language === lang.code
              ? 'bg-white text-zinc-900 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-700'
          }`}
          title={lang.name}
        >
          {lang.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
