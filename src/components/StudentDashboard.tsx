import { useState, useEffect } from 'react';
import { useAttendance, Session } from '../hooks/useAttendance';
import { useAuth } from '../hooks/useAuth';
import { getCurrentLocation, calculateDistance, GeoLocation } from '../utils/geo';
import { MapPin, UserCheck, RefreshCw, AlertCircle, CheckCircle2, Navigation, Clock, History, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import StudentHistory from './StudentHistory';

export default function StudentDashboard() {
  const { profile } = useAuth();
  const { activeSessions, markAttendance } = useAttendance();
  const [currentLocation, setCurrentLocation] = useState<GeoLocation | null>(null);
  const [activeTab, setActiveTab] = useState<'classes' | 'history'>('classes');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  const refreshLocation = async () => {
    setLocating(true);
    setError('');
    try {
      const loc = await getCurrentLocation();
      setCurrentLocation(loc);
    } catch (err: any) {
      setError('Could not access GPS. Please enable location permissions.');
    } finally {
      setLocating(false);
    }
  };

  useEffect(() => {
    refreshLocation();
  }, []);

  const handleMarkAttendance = async (session: Session) => {
    if (!currentLocation) {
      setError('Waiting for current location...');
      return;
    }

    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      session.location.latitude,
      session.location.longitude
    );

    if (distance > session.radius) {
      setError(`You are ${Math.round(distance - session.radius)}m outside the classroom boundary. Move closer to sign in.`);
      return;
    }

    setLoading(true);
    setError('');
    try {
      await markAttendance(session, currentLocation);
      setSuccess(session.id);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to sign attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex p-1 bg-gray-100 rounded-2xl max-w-sm">
        <button
          onClick={() => setActiveTab('classes')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'classes' 
              ? 'bg-white text-indigo-600 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <LayoutGrid size={18} />
          Current Classes
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'history' 
              ? 'bg-white text-indigo-600 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <History size={18} />
          My History
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'classes' ? (
          <motion.div
            key="classes"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-8"
          >
            {/* Location Status Card */}
            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${currentLocation ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                  <Navigation size={24} className={locating ? 'animate-pulse' : ''} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Your Location</h2>
                  <p className="text-xs text-gray-500 font-medium">
                    {currentLocation 
                      ? `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}` 
                      : 'Acquiring GPS coordinates...'}
                  </p>
                  {currentLocation && (
                    <div className="mt-1 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">GPS Active & Verified</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={refreshLocation}
                disabled={locating}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
              >
                <RefreshCw size={18} className={locating ? 'animate-spin' : ''} />
                Refresh GPS
              </button>
            </section>

            {/* Available Sessions */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <MapPin size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Available Classes</h2>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-start gap-3">
                  <AlertCircle size={20} className="shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {activeSessions.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <RefreshCw size={32} />
                  </div>
                  <p className="text-gray-500 font-medium tracking-tight">No active classes at JKUAT right now.<br/>Wait for your lecturer to start the session.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {activeSessions.map((session) => {
                    const distance = currentLocation 
                      ? calculateDistance(currentLocation.latitude, currentLocation.longitude, session.location.latitude, session.location.longitude)
                      : null;
                    
                    const isNear = distance !== null && distance <= session.radius;
                    const isDone = success === session.id;

                    return (
                      <div key={session.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 transition-all overflow-hidden relative">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 ${isDone ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-indigo-600'} rounded-xl flex items-center justify-center font-bold transition-colors`}>
                              {isDone ? <CheckCircle2 size={24} /> : session.courseCode.substring(0, 2)}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">{session.courseCode}</h3>
                              <div className="flex flex-wrap items-center gap-3 mt-1">
                                <span className="text-xs text-gray-500 font-medium">Lecturer: {session.lecturerName}</span>
                                <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                                  <Clock size={14} className="text-indigo-400" />
                                  Active
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:items-end gap-2">
                            <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${isNear ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50'}`}>
                              {distance !== null ? `${Math.round(distance)}m away` : 'Calculating distance...'}
                            </div>
                            <button
                              onClick={() => handleMarkAttendance(session)}
                              disabled={loading || !isNear || isDone}
                              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                isDone 
                                  ? 'bg-green-50 text-green-600' 
                                  : isNear 
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              {isDone ? (
                                <>
                                  <CheckCircle2 size={18} />
                                  Signed In
                                </>
                              ) : (
                                <>
                                  <UserCheck size={18} />
                                  Sign Attendance
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            <StudentHistory />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { GraduationCap } from 'lucide-react';
