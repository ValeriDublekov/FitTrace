import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Exercise } from '../../../types';
import { Copy, Check, AlertCircle, ArrowRightLeft, Filter } from 'lucide-react';
import { motion } from 'motion/react';

interface CustomExerciseMigrationProps {
  customExercises: Exercise[];
  systemExercises: Exercise[];
  onMerge: (customId: string, systemId: string, systemName: string) => Promise<void>;
}

export const CustomExerciseMigration: React.FC<CustomExerciseMigrationProps> = ({ 
  customExercises, 
  systemExercises, 
  onMerge 
}) => {
  const { t } = useTranslation();
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<{ id: string; type: 'success' | 'error'; message: string } | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(customExercises.map(e => e.category)))];
  }, [customExercises]);

  const filteredCustomExercises = useMemo(() => {
    if (categoryFilter === 'All') return customExercises;
    return customExercises.filter(e => e.category === categoryFilter);
  }, [customExercises, categoryFilter]);

  const handleSelect = (customId: string, systemId: string) => {
    setSelections(prev => ({ ...prev, [customId]: systemId }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleMerge = async (customId: string) => {
    const systemId = selections[customId];
    if (!systemId) return;

    const customEx = customExercises.find(e => e.id === customId);
    const systemEx = systemExercises.find(e => e.id === systemId);

    if (!customEx || !systemEx) return;

    // Validation: Match load type
    if (customEx.loadType !== systemEx.loadType) {
      setFeedback({ id: customId, type: 'error', message: t('workout.admin_migration.match_error') });
      return;
    }

    setProcessing(prev => ({ ...prev, [customId]: true }));
    try {
      await onMerge(customId, systemId, systemEx.name);
      setFeedback({ id: customId, type: 'success', message: t('workout.admin_migration.success') });
      // Reset selection for this row
      setSelections(prev => {
        const next = { ...prev };
        delete next[customId];
        return next;
      });
    } catch (error) {
      setFeedback({ id: customId, type: 'error', message: 'Failed to merge' });
    } finally {
      setProcessing(prev => ({ ...prev, [customId]: false }));
      // Clear feedback after 3s
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  if (customExercises.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
        <p className="text-gray-500">{t('workout.admin_migration.no_custom')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{t('workout.admin_migration.title')}</h3>
          <p className="text-sm text-gray-500">{t('workout.admin_migration.description')}</p>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100 self-start sm:self-center">
          <Filter className="w-4 h-4 text-gray-400 ml-2" />
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-700 pr-8"
          >
            {categories.map(c => {
              const categoryKey = String(c).toLowerCase();
              return (
                <option key={String(c)} value={String(c)}>
                  {c === 'All' ? t('workout.titles.select_category') : t(`workout.categories.${categoryKey}`)}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('workout.admin_migration.col_name')}</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('workout.admin_migration.col_replace')}</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('workout.admin_migration.col_action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredCustomExercises.map((ex) => (
              <tr key={ex.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 group">
                      <span className="text-lg font-bold text-gray-900 leading-tight" title={ex.name}>
                        {ex.name}
                      </span>
                      <button 
                        onClick={() => copyToClipboard(ex.name)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-md opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-blue-100 shadow-sm shrink-0"
                        title={t('workout.admin_migration.copy_success')}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold uppercase tracking-wider">
                        {t(`workout.load_types.${ex.loadType.toLowerCase()}`)}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {t(`workout.categories.${ex.category.toLowerCase()}`)}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-4 min-w-[200px]">
                  <select
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={selections[ex.id!] || ''}
                    onChange={(e) => handleSelect(ex.id!, e.target.value)}
                  >
                    <option value="">{t('workout.admin_migration.select_system')}</option>
                    {systemExercises.map((sys) => (
                      <option key={sys.id} value={sys.id}>
                        {sys.name} ({t(`workout.load_types.${sys.loadType.toLowerCase()}`)})
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <button
                      disabled={!selections[ex.id!] || processing[ex.id!]}
                      onClick={() => handleMerge(ex.id!)}
                      className={`flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg font-medium text-sm transition-all shadow-sm
                        ${!selections[ex.id!] 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                        }`}
                    >
                      {processing[ex.id!] ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <ArrowRightLeft className="w-4 h-4" />
                          {t('workout.admin_migration.apply_replace')}
                        </>
                      )}
                    </button>

                    {feedback?.id === ex.id && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-center gap-1.5 text-[10px] font-medium ${
                          feedback.type === 'success' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {feedback.type === 'success' ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {feedback.message}
                      </motion.div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
