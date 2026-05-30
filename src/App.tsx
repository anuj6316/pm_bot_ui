/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  LogOut,
  User as UserIcon,
  Clock,
  Building
} from 'lucide-react';

import { User } from './types';
import AdminLogin from './components/AdminLogin';
import PlaneDashboard from './components/PlaneDashboard';

export default function App() {
  // Screens routing: 'login' | 'dashboard'
  const [currentScreen, setCurrentScreen] = useState<'login' | 'dashboard'>('login');
  const [user, setUser] = useState<User | null>(null);
  
  // Format the current UTC time beautifully
  const [timeStr, setTimeStr] = useState<string>('');
  
  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toUTCString());
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load session or auto-login matching cache
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser({
          email: parsed.email || 'admin@starlight.ai',
          workspaceName: parsed.selected_project || 'Starlight Labs Dev'
        });
        setCurrentScreen('dashboard');
      }
    } catch (e) {}
  }, []);

  // Handle Login success
  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('user_profile');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setCurrentScreen('login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      <AnimatePresence mode="wait">
        {currentScreen === 'login' || !user ? (
          <motion.div
            key="login-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full h-full"
          >
            <AdminLogin onLoginSuccess={handleLoginSuccess} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            <PlaneDashboard 
              user={user} 
              timeStr={timeStr} 
              onLogout={handleLogout} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

