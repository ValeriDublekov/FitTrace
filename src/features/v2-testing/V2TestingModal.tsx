import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Play, RefreshCw, Database, Server, Dumbbell, Award } from 'lucide-react';

interface V2TestingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const V2TestingModal: React.FC<V2TestingModalProps> = ({ isOpen, onClose }) => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [exercises, setExercises] = useState<any[]>([]);
  const [lastWorkout, setLastWorkout] = useState<any>(null);
  const [progressData, setProgressData] = useState<any>(null);
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      checkHealth();
    }
  }, [isOpen]);

  const checkHealth = async () => {
    setIsCheckingHealth(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/v2/health');
      if (res.ok) {
        const data = await res.json();
        setHealthStatus(data);
      } else {
        setHealthStatus({ error: `HTTP ${res.status}` });
      }
    } catch (e: any) {
      setHealthStatus({ error: e.message || 'Сървърът все още зарежда...' });
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const loadExercises = async () => {
    try {
      setActionMessage('Зареждане на упражнения от .NET API...');
      const res = await fetch('/api/v2/api/exercises');
      const data = await res.json();
      if (Array.isArray(data)) {
        setExercises(data);
        setActionMessage(`Заредени ${data.length} упражнения успешно!`);
      }
    } catch (e: any) {
      setActionMessage(`Грешка: ${e.message}`);
    }
  };

  const createSampleWorkout = async () => {
    try {
      setActionMessage('Изпращане на тестова тренировка към .NET API...');
      const benchId = exercises.find(e => e.name === 'Bench Press')?.id || '71e5f6e8-fb02-4602-a816-02bc32e81e5a';
      
      const res = await fetch('/api/v2/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date().toISOString(),
          durationSeconds: 2700,
          notes: 'Тестова тренировка през браузъра (v2)',
          exercises: [
            {
              exerciseId: benchId,
              orderIndex: 1,
              sessionNotes: 'Тест на серии',
              sets: [
                { setIndex: 1, weight: 100, reps: 5, isCompleted: true },
                { setIndex: 2, weight: 105, reps: 5, isCompleted: true },
                { setIndex: 3, weight: 110, reps: 3, isCompleted: true }
              ]
            }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        setLastWorkout(data);
        setActionMessage(`Тренировката е записана! Общ тонаж (изчислен от .NET): ${data.totalVolume} kg`);
        
        // Автоматично извличане на напредъка
        loadProgress(benchId);
      } else {
        const err = await res.text();
        setActionMessage(`Грешка при запис: ${err}`);
      }
    } catch (e: any) {
      setActionMessage(`Грешка: ${e.message}`);
    }
  };

  const loadProgress = async (exerciseId: string) => {
    try {
      const res = await fetch(`/api/v2/api/progress/exercise/${exerciseId}`);
      if (res.ok) {
        const data = await res.json();
        setProgressData(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const runAutomatedTests = async () => {
    setIsRunningTests(true);
    setTestOutput(null);
    try {
      const res = await fetch('/api/v2-tests/run', { method: 'POST' });
      const data = await res.json();
      setTestOutput(data.output || data.error);
    } catch (e: any) {
      setTestOutput(`Грешка при пускане на тестовете: ${e.message}`);
    } finally {
      setIsRunningTests(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-zinc-200">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">FitTrace v2 Тестов Панел</h2>
              <p className="text-xs text-zinc-400">Интерактивно тестване на .NET 9 Web API и релационната база на живо</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Status Banner */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {healthStatus?.status === 'healthy' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              ) : (
                <AlertCircle className="w-6 h-6 text-amber-500" />
              )}
              <div>
                <div className="text-sm font-bold text-zinc-800">
                  {healthStatus?.status === 'healthy' ? '.NET 9 Web API работи на живо!' : 'Проверка на връзката...'}
                </div>
                <div className="text-xs text-zinc-500">
                  Фреймуърк: {healthStatus?.framework || '.NET 9'} | База: {healthStatus?.database || 'Релационна'}
                </div>
              </div>
            </div>
            <button
              onClick={checkHealth}
              disabled={isCheckingHealth}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-100"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin' : ''}`} />
              Обнови
            </button>
          </div>

          {actionMessage && (
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-medium text-indigo-800">
              {actionMessage}
            </div>
          )}

          {/* Action Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={loadExercises}
              className="p-4 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-2xl text-left transition flex flex-col justify-between"
            >
              <Database className="w-5 h-5 text-indigo-600 mb-2" />
              <div>
                <div className="text-xs font-bold text-zinc-800">1. Зареди упражнения</div>
                <div className="text-[11px] text-zinc-500">GET /api/exercises</div>
              </div>
            </button>

            <button
              onClick={createSampleWorkout}
              className="p-4 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-2xl text-left transition flex flex-col justify-between"
            >
              <Dumbbell className="w-5 h-5 text-emerald-600 mb-2" />
              <div>
                <div className="text-xs font-bold text-zinc-800">2. Запиши тренировка</div>
                <div className="text-[11px] text-zinc-500">POST /api/workouts</div>
              </div>
            </button>

            <button
              onClick={runAutomatedTests}
              disabled={isRunningTests}
              className="p-4 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-2xl text-left transition flex flex-col justify-between"
            >
              <Play className="w-5 h-5 text-violet-600 mb-2" />
              <div>
                <div className="text-xs font-bold text-zinc-800">3. Стартирай xUnit тестове</div>
                <div className="text-[11px] text-zinc-500">dotnet test FitTrace.sln</div>
              </div>
            </button>
          </div>

          {/* Results: Exercises */}
          {exercises.length > 0 && (
            <div className="p-4 bg-white border border-zinc-200 rounded-2xl">
              <div className="text-xs font-bold text-zinc-800 mb-2">Налични упражнения от .NET API ({exercises.length}):</div>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {exercises.map((ex) => (
                  <span key={ex.id} className="px-2.5 py-1 bg-zinc-100 text-zinc-700 text-[11px] rounded-lg font-medium">
                    {ex.name} <span className="text-zinc-400">({ex.category})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Results: Progress & 1RM */}
          {progressData && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold mb-2">
                <Award className="w-4 h-4 text-emerald-600" />
                1RM & Тонаж Аналитика от .NET ({progressData.exerciseName}):
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                  <span className="text-zinc-500">Максимална тежест:</span>
                  <div className="text-base font-bold text-zinc-900">{progressData.allTimeMaxWeight} kg</div>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                  <span className="text-zinc-500">Прогнозен 1RM (Epley):</span>
                  <div className="text-base font-bold text-emerald-600">{progressData.allTimeEstimatedOneRepMax} kg</div>
                </div>
              </div>
            </div>
          )}

          {/* Results: Console output of xUnit tests */}
          {testOutput && (
            <div className="p-4 bg-zinc-900 text-zinc-200 rounded-2xl font-mono text-xs overflow-x-auto max-h-48 border border-zinc-800">
              <div className="text-zinc-400 text-[10px] uppercase font-bold mb-1">Резултат от dotnet test:</div>
              <pre className="whitespace-pre-wrap">{testOutput}</pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-zinc-900 rounded-xl hover:bg-zinc-800 transition"
          >
            Затвори
          </button>
        </div>
      </div>
    </div>
  );
};
