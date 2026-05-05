import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PlusCircle, History, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight font-sans">
          Welcome back, {user?.displayName?.split(' ')[0]}
        </h1>
        <p className="text-zinc-500 mt-1">Ready for today's session?</p>
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
            <h3 className="font-bold text-xl">Start New Workout</h3>
            <p className="text-zinc-400 text-sm mt-1">Log exercises on the fly</p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white border border-zinc-200 p-6 rounded-3xl flex flex-col items-start gap-4 shadow-sm active:shadow-none transition-all group"
        >
          <div className="bg-zinc-100 p-3 rounded-2xl group-hover:bg-zinc-200 transition-colors">
            <History className="w-6 h-6 text-zinc-600" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-xl text-zinc-900">View History</h3>
            <p className="text-zinc-500 text-sm mt-1">Past sessions and logs</p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white border border-zinc-200 p-6 rounded-3xl flex flex-col items-start gap-4 shadow-sm active:shadow-none transition-all group"
        >
          <div className="bg-zinc-100 p-3 rounded-2xl group-hover:bg-zinc-200 transition-colors">
            <TrendingUp className="w-6 h-6 text-zinc-600" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-xl text-zinc-900">Analytics</h3>
            <p className="text-zinc-500 text-sm mt-1">Charts and progression</p>
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default Dashboard;
