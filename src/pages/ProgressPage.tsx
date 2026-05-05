import React, { useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Search, TrendingUp, Calendar, ArrowRight, History as HistoryIcon, Dumbbell } from 'lucide-react';
import { useExercises } from '../hooks/useExercises';
import { useExerciseHistory } from '../hooks/useExerciseHistory';
import { Exercise, LoadType, WorkoutExercise } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const ProgressPage: React.FC = () => {
  const { exercises, loading: exercisesLoading } = useExercises();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedExercise = exercises.find(e => e.id === selectedExerciseId);
  const { history, loading: historyLoading } = useExerciseHistory(selectedExerciseId || undefined);

  const filteredExercises = exercises.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const chartData = useMemo(() => {
    if (!history || !selectedExercise) return [];

    return history
      .map(workout => {
        const exerciseData = workout.exercises.find(ex => ex.exerciseId === selectedExercise.id);
        if (!exerciseData) return null;

        const maxVal = exerciseData.sets.reduce((max, set) => {
          const val = selectedExercise.loadType === 'WEIGHT_REPS' ? (set.weight || 0) : (set.level || 0);
          return val > max ? val : max;
        }, 0);

        return {
          date: workout.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          timestamp: workout.date.getTime(),
          value: maxVal,
          workoutId: workout.id
        };
      })
      .filter((d): d is any => d !== null)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [history, selectedExercise]);

  const unit = selectedExercise?.loadType === 'WEIGHT_REPS' ? 'kg' : 'Level';

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
          <TrendingUp className="text-indigo-600" />
          Progress
        </h1>
        <p className="text-zinc-500 mt-1">Track your growth and peak performance.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar: Exercise Selector */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input 
              id="exercise-search"
              type="text"
              placeholder="Search exercise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
            />
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm max-h-[60vh] overflow-y-auto">
            {exercisesLoading ? (
               <div className="p-8 flex justify-center">
                 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
               </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {filteredExercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => setSelectedExerciseId(ex.id || null)}
                    className={`w-full text-left p-4 hover:bg-zinc-50 transition-colors flex items-center gap-3 ${
                      selectedExerciseId === ex.id ? 'bg-indigo-50 text-indigo-700' : 'text-zinc-600'
                    }`}
                  >
                    <div className="bg-zinc-100 p-2 rounded-lg shrink-0">
                      <Dumbbell className={`w-4 h-4 ${selectedExerciseId === ex.id ? 'text-indigo-600' : 'text-zinc-400'}`} />
                    </div>
                    <div>
                      <div className="text-sm font-bold truncate">{ex.name}</div>
                      <div className="text-[10px] uppercase tracking-wider text-zinc-400 mt-0.5">{ex.category}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content: Chart & Stats */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {!selectedExerciseId ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-dashed border-zinc-300 rounded-3xl p-12 text-center"
              >
                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowRight className="text-zinc-400 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900">Select an exercise</h3>
                <p className="text-zinc-500 text-sm">Select an exercise from the left to visualize your progress.</p>
              </motion.div>
            ) : historyLoading ? (
              <div className="h-64 flex items-center justify-center bg-white border border-zinc-200 rounded-3xl">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : chartData.length > 0 ? (
              <motion.div 
                key={selectedExerciseId}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Chart */}
                <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-bold text-lg text-zinc-900">Performance Over Time</h2>
                    <span className="bg-indigo-100 text-indigo-700 text-[10px] uppercase font-black px-2 py-1 rounded-md">Peak {unit}</span>
                  </div>
                  <div className="h-64 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: '#94a3b8' }}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: '#94a3b8' }}
                          dx={-10}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '16px', 
                            border: 'none', 
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            fontSize: '12px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#4f46e5" 
                          strokeWidth={4} 
                          dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                          name={unit}
                          animationDuration={1000}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* History List */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-zinc-900 font-bold">
                    <HistoryIcon className="w-5 h-5 text-indigo-600" />
                    Recent Sessions
                  </div>
                  <div className="space-y-3">
                    {history.map((workout) => {
                      const ex = workout.exercises.find(e => e.exerciseId === selectedExerciseId);
                      return (
                        <div key={workout.id} className="bg-white border border-zinc-200 rounded-2xl p-4 flex justify-between items-center group hover:border-indigo-200 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="bg-zinc-50 p-2.5 rounded-xl text-zinc-500 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-bold text-zinc-900">
                                {workout.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </div>
                              <div className="text-xs text-zinc-400">
                                {ex?.sets.length} sets logged
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-black text-zinc-900">
                              {ex?.sets.reduce((max, s) => {
                                const val = selectedExercise.loadType === 'WEIGHT_REPS' ? (s.weight || 0) : (s.level || 0);
                                return val > max ? val : max;
                              }, 0)}
                              <span className="text-[10px] font-bold text-zinc-400 ml-1 uppercase">{unit}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white border border-zinc-200 rounded-3xl p-12 text-center"
              >
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HistoryIcon className="text-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900">No history yet</h3>
                <p className="text-zinc-500 text-sm">Start a workout with this exercise to see your progress here.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
