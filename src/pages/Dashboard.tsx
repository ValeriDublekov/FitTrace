import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUserSettings } from '../hooks/useUserSettings';
import { PlusCircle, History, TrendingUp, Type } from 'lucide-react';
import { motion } from 'motion/react';
import { FontSize } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { settings: userSettings, updateFontSize } = useUserSettings();
  const navigate = useNavigate();

  const fontSizeOptions: { label: string; value: FontSize }[] = [
    { label: 'Нормален', value: 'normal' },
    { label: 'Голям', value: 'large' },
    { label: 'Много голям', value: 'xlarge' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight font-sans">
          Здравей, {user?.displayName?.split(' ')[0]}
        </h1>
        <p className="text-zinc-500 mt-1">Готов ли си за днешната тренировка?</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/new-workout')}
          className="bg-zinc-900 text-white p-6 rounded-3xl flex flex-col items-start gap-4 shadow-lg active:shadow-md transition-all group"
        >
          <div className="bg-white/10 p-3 rounded-2xl group-hover:bg-white/20 transition-colors">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-xl">Нова тренировка</h3>
            <p className="text-zinc-400 text-sm mt-1">Записвай упражнения в реално време</p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/history')}
          className="bg-white border border-zinc-200 p-6 rounded-3xl flex flex-col items-start gap-4 shadow-sm active:shadow-none transition-all group"
        >
          <div className="bg-zinc-100 p-3 rounded-2xl group-hover:bg-zinc-200 transition-colors">
            <History className="w-6 h-6 text-zinc-600" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-xl text-zinc-900">История</h3>
            <p className="text-zinc-500 text-sm mt-1">Предишни сесии и лог</p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/history')}
          className="bg-white border border-zinc-200 p-6 rounded-3xl flex flex-col items-start gap-4 shadow-sm active:shadow-none transition-all group"
        >
          <div className="bg-zinc-100 p-3 rounded-2xl group-hover:bg-zinc-200 transition-colors">
            <TrendingUp className="w-6 h-6 text-zinc-600" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-xl text-zinc-900">Анализи</h3>
            <p className="text-zinc-500 text-sm mt-1">Графики и прогрес</p>
          </div>
        </motion.button>
      </div>

      <div className="mt-12 max-w-lg">
        <div className="bg-white border border-zinc-200 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-50 p-2.5 rounded-2xl">
              <Type className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-zinc-900">Настройки на дисплея</h3>
              <p className="text-zinc-500 text-sm">Удобство при тренировка без очила</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="text-zinc-700 font-medium text-sm">Размер на шрифта:</p>
            <div className="flex p-1.5 bg-zinc-100 rounded-2xl">
              {fontSizeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateFontSize(option.value)}
                  className={`flex-1 py-3 px-2 rounded-xl text-sm font-semibold transition-all ${
                    userSettings?.fontSize === option.value
                      ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-zinc-200'
                      : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-zinc-400 text-[0.8rem] italic px-1">
              * Промяната се прилага веднага към целия интерфейс.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
