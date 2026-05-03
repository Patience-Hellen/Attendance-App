import { useState } from 'react';
import { useAttendance, Session } from '../hooks/useAttendance';
import { useAuth } from '../hooks/useAuth';
import { getCurrentLocation } from '../utils/geo';
import { Plus, Users, Clock, MapPin, StopCircle, CheckCircle2, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SessionAttendanceList from './SessionAttendanceList';

export default function LecturerDashboard() {
  const { profile } = useAuth();
  const { activeSessions, createSession, endSession } = useAttendance();
  const [courseCode, setCourseCode] = useState('');
  const [radius, setRadius] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const handleStartSession = async () => {
    if (!courseCode.trim()) {
      setError('Please enter a course code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const location = await getCurrentLocation();
      await createSession(courseCode, location, radius);
      setCourseCode('');
    } catch (err: any) {
      console.error("GPS Error:", err);
      if (err.code === 1) {
        setError('Location Access Denied. Please enable GPS in your browser settings and refresh the page. If in an iframe, try opening the app in a new tab.');
      } else {
        setError(err.message || 'Failed to capture GPS location');
      }
    } finally {
      setLoading(false);
    }
  };

  const myActiveSessions = activeSessions.filter(s => s.lecturerId === profile?.uid || s.id.startsWith('mock-'));

  return (
    <div className="space-y-8">
      {/* Create Session Card */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Plus size={20} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Start New Session</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Course Code</label>
            <input
              type="text"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              placeholder="e.g. BIT 2102"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Geofence Radius (meters)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="10"
                max="200"
                step="10"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="flex-1 accent-indigo-600"
              />
              <span className="text-sm font-bold text-indigo-600 w-12 text-right">{radius}m</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <button
          onClick={handleStartSession}
          disabled={loading}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Plus size={20} />
              Initialize Geofence
            </>
          )}
        </button>
      </section>

      {/* Active Sessions List */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <Clock size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Active Sessions</h2>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-widest">
            Live
          </span>
        </div>

        {myActiveSessions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Users size={32} />
            </div>
            <p className="text-gray-500 font-medium tracking-tight">No active sessions found.<br/>Start one to begin tracking attendance.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {myActiveSessions.map((session) => (
              <div key={session.id} className="space-y-4">
                <div className={`bg-white rounded-2xl shadow-sm border ${selectedSessionId === session.id ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-100'} p-5 transition-all`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                        {session.courseCode.substring(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 hidden sm:block">{session.courseCode}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                            <MapPin size={14} className="text-indigo-400" />
                            {session.radius}m Radius
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                            <Clock size={14} className="text-indigo-400" />
                            Started {session.startTime?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedSessionId(selectedSessionId === session.id ? null : session.id)}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                          selectedSessionId === session.id 
                            ? 'bg-indigo-600 text-white shadow-md' 
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <Users size={18} />
                        View Attendance
                      </button>
                      <button
                        onClick={() => endSession(session.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg text-sm font-bold transition-all border border-red-100"
                      >
                        <StopCircle size={18} />
                        <span className="hidden sm:inline">End Session</span>
                      </button>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {selectedSessionId === session.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                    >
                      <SessionAttendanceList sessionId={session.id} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Activity / Logs for Dummy Feel */}
      <section className="bg-gray-50 rounded-[2.5rem] p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <BookOpen size={20} className="text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Attendance History</h2>
          </div>
          <button className="text-xs font-bold text-indigo-600 hover:underline">Download Report</button>
        </div>
        
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Student Details</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reg Number</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unit Code</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { name: 'John Dose', reg: 'SCM211-0000/2022', code: 'BIT 2102', time: '10:15 AM' },
                  { name: 'Alice Wambui', reg: 'SCM211-0045/2022', code: 'BIT 2102', time: '10:18 AM' },
                  { name: 'Kevin Otieno', reg: 'SCM211-0102/2022', code: 'BIT 2102', time: '10:22 AM' },
                  { name: 'Sarah Chepkoech', reg: 'SCM211-0089/2022', code: 'SCS 2204', time: 'Yesterday' }
                ].map((rec, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                          {rec.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm font-bold text-gray-900">{rec.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded-md">{rec.reg}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-indigo-600">{rec.code}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 justify-end">
                        <CheckCircle2 size={14} />
                        Present
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">{rec.time}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
