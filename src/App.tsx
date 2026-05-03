/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthProvider, useAuth } from './hooks/useAuth';
import Auth from './components/Auth';
import LecturerDashboard from './components/LecturerDashboard';
import StudentDashboard from './components/StudentDashboard';
import { LogOut, GraduationCap, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading JKUAT Geofence...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-tight">JKUAT Attendance</h1>
              <div className="flex items-center gap-1 text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                <MapPin size={10} className="text-indigo-500" />
                Geofenced System
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{profile.name}</p>
              <p className="text-xs text-gray-500 capitalize">{profile.role}</p>
            </div>
            <button
              onClick={signOut}
              className="px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all flex items-center gap-2 border border-transparent hover:border-red-100"
              title="Sign Out"
            >
              <LogOut size={20} />
              <span className="text-sm font-bold hidden md:block">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={profile.role}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {profile.role === 'lecturer' ? (
              <LecturerDashboard />
            ) : (
              <StudentDashboard />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-400 text-sm">
        <p>© 2026 JKUAT Geofence Attendance System</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
