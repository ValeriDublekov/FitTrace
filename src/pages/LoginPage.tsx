import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Dumbbell } from 'lucide-react';
import { motion } from 'motion/react';

const LoginPage: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center"
      >
        <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6">
          <Dumbbell className="text-white w-8 h-8" />
        </div>
        
        <h1 className="text-3xl font-bold text-zinc-900 mb-2 font-sans tracking-tight">FitTrace</h1>
        <p className="text-zinc-500 text-center mb-8">Track your progress, build your strength. Log your workouts seamlessly.</p>
        
        <button
          onClick={login}
          className="w-full flex items-center justify-center gap-3 bg-white border border-zinc-200 text-zinc-700 font-medium py-3 px-4 rounded-xl hover:bg-zinc-50 transition-colors shadow-sm active:scale-95"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>
        
        <p className="mt-8 text-xs text-zinc-400 text-center">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
