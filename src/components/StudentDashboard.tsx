import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  FlatList
} from 'react-native';
import { useAttendance, Session } from '../hooks/useAttendance';
import { useAuth } from '../hooks/useAuth';
import { getCurrentLocation, calculateDistance, GeoLocation } from '../utils/geo';
import { 
  MapPin, 
  UserCheck, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Navigation, 
  Clock, 
  History, 
  LayoutGrid 
} from 'lucide-react';
import StudentHistory from './StudentHistory';

export default function StudentDashboard() {
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
      setError(`You are ${Math.round(distance - session.radius)}m outside. Move closer.`);
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

  const renderSession = ({ item: session }: { item: Session }) => {
    const distance = currentLocation 
      ? calculateDistance(currentLocation.latitude, currentLocation.longitude, session.location.latitude, session.location.longitude)
      : null;
    
    const isNear = distance !== null && distance <= session.radius;
    const isDone = success === session.id;

    return (
      <View style={styles.sessionCard}>
        <View style={styles.sessionRow}>
          <View style={[styles.sessionIcon, isDone && styles.sessionIconDone]}>
            {isDone ? <CheckCircle2 size={24} color="#16a34a" /> : <Text style={styles.sessionIconText}>{session.courseCode.substring(0, 2)}</Text>}
          </View>
          <View style={styles.sessionMain}>
            <Text style={styles.sessionCode}>{session.courseCode}</Text>
            <Text style={styles.sessionLecturer}>Lecturer: {session.lecturerName}</Text>
          </View>
        </View>

        <View style={styles.sessionFooter}>
          <View style={[styles.distanceBadge, isNear ? styles.distanceBadgeNear : styles.distanceBadgeFar]}>
            <Text style={[styles.distanceText, isNear ? styles.distanceTextNear : styles.distanceTextFar]}>
              {distance !== null ? `${Math.round(distance)}m away` : 'Calculating...'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleMarkAttendance(session)}
            disabled={loading || !isNear || isDone}
            style={[
              styles.signButton,
              isDone ? styles.signButtonDone : isNear ? styles.signButtonActive : styles.signButtonDisabled
            ]}
          >
            {isDone ? (
              <CheckCircle2 size={16} color="#16a34a" />
            ) : (
              <UserCheck size={16} color={isNear ? "#fff" : "#9ca3af"} />
            )}
            <Text style={[
              styles.signButtonText,
              isDone ? styles.signButtonTextDone : isNear ? styles.signButtonTextActive : styles.signButtonTextDisabled
            ]}>
              {isDone ? 'Signed' : 'Sign Attendance'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity 
          onPress={() => setActiveTab('classes')}
          style={[styles.tab, activeTab === 'classes' && styles.tabActive]}
        >
          <LayoutGrid size={18} color={activeTab === 'classes' ? '#4f46e5' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'classes' && styles.tabTextActive]}>Classes</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('history')}
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
        >
          <History size={18} color={activeTab === 'history' ? '#4f46e5' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>History</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'classes' ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusInfo}>
              <View style={[styles.locIcon, currentLocation ? styles.locIconActive : styles.locIconPending]}>
                <Navigation size={24} color={currentLocation ? '#16a34a' : '#d97706'} />
              </View>
              <View>
                <Text style={styles.statusTitle}>Your Location</Text>
                <Text style={styles.statusCoords}>
                  {currentLocation 
                    ? `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}` 
                    : 'Acquiring GPS...'}
                </Text>
                {currentLocation && (
                  <View style={styles.verifiedBadge}>
                     <View style={styles.dot} />
                     <Text style={styles.verifiedText}>GPS ACTIVE</Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity onPress={refreshLocation} disabled={locating} style={styles.refreshBtn}>
              <RefreshCw size={18} color="#4b5563" />
            </TouchableOpacity>
          </View>

          {/* List Title */}
          <View style={styles.listHeader}>
            <MapPin size={20} color="#4f46e5" />
            <Text style={styles.listTitle}>Available Classes</Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <AlertCircle size={20} color="#dc2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {activeSessions.length === 0 ? (
            <View style={styles.emptyState}>
              <RefreshCw size={32} color="#d1d5db" />
              <Text style={styles.emptyText}>No active classes at JKUAT right now.</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {activeSessions.map(session => (
                <View key={session.id}>
                  {renderSession({ item: session })}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        <StudentHistory />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 4,
    borderRadius: 15,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#4f46e5',
  },
  content: {
    flex: 1,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginBottom: 25,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  locIcon: {
    padding: 10,
    borderRadius: 15,
  },
  locIconActive: {
    backgroundColor: '#f0fdf4',
  },
  locIconPending: {
    backgroundColor: '#fffbeb',
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  statusCoords: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  dot: {
    width: 6,
    height: 6,
    backgroundColor: '#16a34a',
    borderRadius: 3,
  },
  verifiedText: {
    fontSize: 8,
    color: '#16a34a',
    fontWeight: '900',
  },
  refreshBtn: {
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  list: {
    gap: 15,
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 15,
  },
  sessionIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#f5f3ff',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionIconDone: {
    backgroundColor: '#f0fdf4',
  },
  sessionIconText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  sessionMain: {
    flex: 1,
  },
  sessionCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  sessionLecturer: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  sessionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f9fafb',
  },
  distanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  distanceBadgeNear: {
    backgroundColor: '#f0fdf4',
  },
  distanceBadgeFar: {
    backgroundColor: '#fffbeb',
  },
  distanceText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  distanceTextNear: {
    color: '#16a34a',
  },
  distanceTextFar: {
    color: '#d97706',
  },
  signButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
  },
  signButtonActive: {
    backgroundColor: '#002B5B',
  },
  signButtonDisabled: {
    backgroundColor: '#f9fafb',
  },
  signButtonDone: {
    backgroundColor: '#f0fdf4',
  },
  signButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  signButtonTextActive: {
    color: '#fff',
  },
  signButtonTextDisabled: {
    color: '#9ca3af',
  },
  signButtonTextDone: {
    color: '#16a34a',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 15,
    marginBottom: 15,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  }
});
