import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useAttendance } from '../hooks/useAttendance';
import { Calendar, Clock, User, CheckCircle2 } from 'lucide-react';

export default function StudentHistory() {
  const { myAttendance } = useAttendance();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance History</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{myAttendance.length} Records</Text>
        </View>
      </View>

      {myAttendance.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Calendar size={32} color="#d1d5db" />
          </View>
          <Text style={styles.emptyText}>No attendance records found yet.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {myAttendance.map((record) => (
            <View key={record.id} style={styles.card}>
              <View style={styles.row}>
                <View style={styles.courseIcon}>
                  <Text style={styles.courseIconText}>{record.courseCode?.substring(0, 2) || '?'}</Text>
                </View>
                <View style={styles.main}>
                  <Text style={styles.courseCode}>{record.courseCode}</Text>
                  <View style={styles.meta}>
                    <View style={styles.metaItem}>
                      <User size={12} color="#4f46e5" />
                      <Text style={styles.metaText}>{record.lecturerName}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Clock size={12} color="#4f46e5" />
                      <Text style={styles.metaText}>
                        {record.timestamp?.toDate().toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric'
                        })} at {record.timestamp?.toDate().toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.footer}>
                <View style={styles.statusBadge}>
                   <CheckCircle2 size={12} color="#16a34a" />
                   <Text style={styles.statusText}>{record.status}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  badge: {
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  empty: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  courseIcon: {
    width: 44,
    height: 44,
    backgroundColor: '#f5f3ff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseIconText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  main: {
    flex: 1,
  },
  courseCode: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },
  meta: {
    marginTop: 4,
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f9fafb',
    alignItems: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    color: '#16a34a',
    fontWeight: 'bold',
  }
});
