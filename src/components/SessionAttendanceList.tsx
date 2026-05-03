import { useEffect } from 'react';
import { useAttendance } from '../hooks/useAttendance';
import { User, Clock, CheckCircle2 } from 'lucide-react';

export default function SessionAttendanceList({ sessionId }: { sessionId: string }) {
  const { sessionAttendance, listenToSessionAttendance } = useAttendance();

  useEffect(() => {
    const unsubscribe = listenToSessionAttendance(sessionId);
    return () => unsubscribe();
  }, [sessionId]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Attendance List</span>
        <span className="text-xs font-bold text-indigo-600">{sessionAttendance.length} Present</span>
      </div>
      <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
        {sessionAttendance.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            Waiting for students to join...
          </div>
        ) : (
          sessionAttendance.map((record) => (
            <div key={record.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                  <User size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{record.studentName}</p>
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tight">{record.regNo}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 font-medium">
                  {record.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <CheckCircle2 size={16} className="text-green-500" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
