import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Slider
} from 'react-native';
import { useAttendance, Session } from '../hooks/useAttendance';
import { useAuth } from '../hooks/useAuth';
import { getCurrentLocation } from '../utils/geo';
import { Plus, Users, Clock, MapPin, StopCircle, CheckCircle2, BookOpen } from 'lucide-react';
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
      setError(err.message || 'Failed to capture GPS location');
    } finally {
      setLoading(false);
    }
  };

  const myActiveSessions = activeSessions.filter(s => s.lecturerId === profile?.uid || s.id.startsWith('mock-'));

  return (
    <View style={styles.container}>
      {/* Create Session Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <Plus size={20} color="#4f46e5" />
          </View>
          <Text style={styles.cardTitle}>Start New Session</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>COURSE CODE</Text>
            <TextInput
              value={courseCode}
              onChangeText={setCourseCode}
              placeholder="e.g. BIT 2102"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
               <Text style={styles.label}>GEOFENCE RADIUS</Text>
               <Text style={styles.radiusVal}>{radius}m</Text>
            </View>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderText}>10m</Text>
              <View style={styles.sliderMock}>
                <View style={[styles.sliderTrack, { width: `${(radius/200)*100}%` }]} />
                <TouchableOpacity 
                   onPress={() => setRadius(r => r === 200 ? 50 : r + 50)}
                   style={[styles.sliderThumb, { left: `${(radius/200)*100}%` }]} 
                />
              </View>
              <Text style={styles.sliderText}>200m</Text>
            </View>
            <Text style={styles.tip}>Tap to increase radius by 50m increments</Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity 
            onPress={handleStartSession} 
            disabled={loading}
            style={styles.btn}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.btnContent}>
                <Plus size={20} color="#fff" />
                <Text style={styles.btnText}>Initialize Geofence</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Sessions List */}
      <View style={styles.listSection}>
        <View style={styles.sectionHeader}>
           <View style={styles.headerTitle}>
              <Clock size={20} color="#16a34a" />
              <Text style={styles.sectionTitle}>Active Sessions</Text>
           </View>
           <View style={styles.liveBadge}>
              <Text style={styles.liveText}>LIVE</Text>
           </View>
        </View>

        {myActiveSessions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Users size={32} color="#d1d5db" />
            <Text style={styles.emptyText}>No active sessions found.</Text>
          </View>
        ) : (
          myActiveSessions.map(session => (
            <View key={session.id} style={styles.sessionBox}>
              <View style={[styles.sessionMain, selectedSessionId === session.id && styles.sessionSelected]}>
                <View style={styles.sessionRow}>
                  <View style={styles.sessionThumb}>
                    <Text style={styles.sessThumbText}>{session.courseCode.substring(0, 2)}</Text>
                  </View>
                  <View style={styles.sessInfo}>
                    <Text style={styles.sessCode}>{session.courseCode}</Text>
                    <View style={styles.sessMeta}>
                       <MapPin size={12} color="#9ca3af" />
                       <Text style={styles.sessMetaText}>{session.radius}m Radius</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.sessActions}>
                   <TouchableOpacity 
                     onPress={() => setSelectedSessionId(selectedSessionId === session.id ? null : session.id)}
                     style={[styles.actionBtn, selectedSessionId === session.id && styles.actionBtnActive]}
                   >
                     <Users size={16} color={selectedSessionId === session.id ? "#fff" : "#111827"} />
                     <Text style={[styles.actionBtnText, selectedSessionId === session.id && styles.actionBtnTextActive]}>
                       Attendance
                     </Text>
                   </TouchableOpacity>
                   <TouchableOpacity 
                     onPress={() => endSession(session.id)}
                     style={styles.endBtn}
                   >
                     <StopCircle size={16} color="#dc2626" />
                   </TouchableOpacity>
                </View>
              </View>

              {selectedSessionId === session.id && (
                <View style={styles.attendanceWrap}>
                   <SessionAttendanceList sessionId={session.id} />
                </View>
              )}
            </View>
          ))
        )}
      </View>

      {/* History Header */}
      <View style={styles.historySection}>
         <View style={styles.sectionHeader}>
            <View style={styles.headerTitle}>
               <BookOpen size={20} color="#4f46e5" />
               <Text style={styles.sectionTitle}>Attendance Logs</Text>
            </View>
            <TouchableOpacity><Text style={styles.link}>Report</Text></TouchableOpacity>
         </View>
         
         <View style={styles.historyCard}>
            {[
              { name: 'John Doe', reg: 'SCM211-0000/2022', code: 'BIT 2102' },
              { name: 'Alice Wambui', reg: 'SCM211-0045/2022', code: 'BIT 2102' }
            ].map((rec, i) => (
              <View key={i} style={styles.historyRow}>
                <View style={styles.historyLeft}>
                  <Text style={styles.histName}>{rec.name}</Text>
                  <Text style={styles.histReg}>{rec.reg}</Text>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.histCode}>{rec.code}</Text>
                  <View style={styles.present}>
                    <CheckCircle2 size={12} color="#16a34a" />
                    <Text style={styles.presentText}>Present</Text>
                  </View>
                </View>
              </View>
            ))}
         </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginBottom: 25,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  iconBox: {
    backgroundColor: '#f5f3ff',
    padding: 8,
    borderRadius: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    color: '#9ca3af',
    letterSpacing: 1.2,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  radiusVal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 15,
    padding: 12,
    fontSize: 15,
    fontWeight: '500',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 5,
  },
  sliderMock: {
    flex: 1,
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    position: 'relative',
    justifyContent: 'center',
  },
  sliderTrack: {
    height: '100%',
    backgroundColor: '#4f46e5',
    borderRadius: 3,
  },
  sliderThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4f46e5',
    position: 'absolute',
    marginLeft: -10,
  },
  sliderText: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: 'bold',
  },
  tip: {
    fontSize: 10,
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  btn: {
    backgroundColor: '#002B5B',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    padding: 10,
    borderRadius: 12,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  listSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  liveBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  liveText: {
    fontSize: 8,
    color: '#16a34a',
    fontWeight: '900',
    letterSpacing: 1,
  },
  emptyCard: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f9fafb',
    borderStyle: 'dashed',
  },
  emptyText: {
    marginTop: 10,
    color: '#9ca3af',
    fontSize: 14,
  },
  sessionBox: {
    marginBottom: 10,
  },
  sessionMain: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  sessionSelected: {
    borderColor: '#4f46e5',
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 15,
  },
  sessionThumb: {
    width: 44,
    height: 44,
    backgroundColor: '#f5f3ff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessThumbText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  sessInfo: {
    flex: 1,
  },
  sessCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  sessMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  sessMetaText: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
  },
  sessActions: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#f9fafb',
    paddingTop: 15,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  actionBtnActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
  },
  actionBtnTextActive: {
    color: '#fff',
  },
  endBtn: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 10,
  },
  attendanceWrap: {
    marginTop: 10,
    padding: 5,
  },
  historySection: {
    backgroundColor: '#f8fafc',
    borderRadius: 30,
    padding: 15,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  historyLeft: {
    gap: 2,
  },
  histName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  histReg: {
    fontSize: 11,
    color: '#9ca3af',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  historyRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  histCode: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  present: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  presentText: {
    fontSize: 10,
    color: '#16a34a',
    fontWeight: 'bold',
  },
  link: {
    fontSize: 12,
    color: '#4f46e5',
    fontWeight: 'bold',
  }
});
