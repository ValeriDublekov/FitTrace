import React from 'react';
import { ExternalLink, ChevronUp, History, X, Sparkles } from 'lucide-react';
import { Exercise } from '../../../types';

interface ExerciseLoggerHeaderProps {
  exercise: Exercise;
  showHistory: boolean;
  onToggleHistory: () => void;
  showDescription: boolean;
  onToggleDescription: () => void;
  onDeleteRequest: () => void;
}

export const ExerciseLoggerHeader: React.FC<ExerciseLoggerHeaderProps> = ({
  exercise,
  showHistory,
  onToggleHistory,
  showDescription,
  onToggleDescription,
  onDeleteRequest
}) => {
  return (
    <header className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 overflow-hidden flex-shrink-0">
          {exercise.thumbnailUrl ? (
            <img src={exercise.thumbnailUrl} alt={exercise.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-300 uppercase tracking-tighter">No img</div>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-slate-900 tracking-tight break-words leading-tight">{exercise.name}</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest [.font-size-large_&]:hidden [.font-size-xlarge_&]:hidden">{exercise.category}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={onToggleDescription}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${showDescription ? 'text-indigo-600 bg-indigo-50 font-bold border border-indigo-150' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
          title="Инструкции и AI съвети"
        >
          <Sparkles size={20} className={showDescription ? 'animate-pulse' : ''} />
        </button>
        {exercise.url && (
          <a 
            href={exercise.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
          >
            <ExternalLink size={20} />
          </a>
        )}
        <button 
          onClick={onToggleHistory}
          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
        >
          {showHistory ? <ChevronUp size={20} /> : <History size={20} />}
        </button>
        <button 
          onClick={onDeleteRequest}
          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
        >
          <X size={20} />
        </button>
      </div>
    </header>
  );
};
