import { useAttendance } from '../hooks/useAttendance';
import { BookOpen, Calendar, Clock, User, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function StudentHistory() {
  const { myAttendance } = useAttendance();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-900">Attendance History</h2>
        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-wider">
          {myAttendance.length} Records
        </span>
      </div>

      {myAttendance.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <Calendar size={32} />
          </div>
          <p className="text-gray-500 font-medium tracking-tight">No attendance records found yet.<br/>Join a class to start your record.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {myAttendance.map((record, index) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:border-indigo-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold shrink-0">
                  {record.courseCode?.substring(0, 2) || '?' }
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{record.courseCode}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                    <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <User size={14} className="text-indigo-400" />
                      {record.lecturerName}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <Clock size={14} className="text-indigo-400" />
                      {record.timestamp?.toDate().toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })} at {record.timestamp?.toDate().toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold ring-1 ring-green-100">
                  <CheckCircle2 size={14} />
                  {record.status}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
