/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useAdmin } from './hooks/useAdmin';
import { useAppSettings } from './hooks/useAppSettings';
import { useUserSettings } from './hooks/useUserSettings';
import Navbar from './components/layout/Navbar';
import { InstallPrompt } from './components/pwa/InstallPrompt';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AdminPage from './pages/AdminPage';
import NewWorkout from './pages/NewWorkout';
import ProgressPage from './pages/ProgressPage';
import MyExercisesPage from './pages/MyExercisesPage';
import { Lock, LogOut } from 'lucide-react';

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, loading } = useAdmin();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { settings, loading: settingsLoading } = useAppSettings();
  const { settings: userSettings, loading: userSettingsLoading } = useUserSettings();

  const loading = authLoading || adminLoading || settingsLoading || userSettingsLoading;

  React.useEffect(() => {
    const fontSize = userSettings?.fontSize || 'normal';
    const root = document.documentElement;
    
    // Remove existing font size classes
    root.classList.remove('font-size-normal', 'font-size-large', 'font-size-xlarge');
    // Add current font size class
    root.classList.add(`font-size-${fontSize}`);
  }, [userSettings?.fontSize]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  // Check for public access
  if (settings && !settings.isPublic && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
            <Lock className="text-amber-600 w-8 h-8" />
          </div>
          
          <h1 className="text-2xl font-bold text-zinc-900 mb-2 font-sans tracking-tight">App Under Maintenance</h1>
          <p className="text-zinc-500 mb-8">
            FitTrace is currently in private mode. Access is restricted to administrators while we prepare for public launch.
          </p>
          
          <button
            onClick={logout}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new-workout" element={<NewWorkout />} />
            <Route path="/history" element={<ProgressPage />} />
            <Route path="/my-exercises" element={<MyExercisesPage />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedAdminRoute>
                  <AdminPage />
                </ProtectedAdminRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <InstallPrompt />
      </div>
    </Router>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
