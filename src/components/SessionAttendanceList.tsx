import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useAttendance } from '../hooks/useAttendance';
import { User, CheckCircle2 } from 'lucide-react';

export default function SessionAttendanceList({ sessionId }: { sessionId: string }) {
  const { sessionAttendance, listenToSessionAttendance } = useAttendance();

  useEffect(() => {
    const unsubscribe = listenToSessionAttendance(sessionId);
    return () => unsubscribe();
  }, [sessionId]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>ATTENDANCE LIST</Text>
        <Text style={styles.countText}>{sessionAttendance.length} Present</Text>
      </View>
      
      <View style={styles.list}>
        {sessionAttendance.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Waiting for students to join...</Text>
          </View>
        ) : (
          sessionAttendance.map((record) => (
            <View key={record.id} style={styles.item}>
              <View style={styles.left}>
                <View style={styles.iconCircle}>
                  <User size={16} color="#4f46e5" />
                </View>
                <View>
                  <Text style={styles.name}>{record.studentName}</Text>
                  <Text style={styles.reg}>{record.regNo}</Text>
                </View>
              </View>
              <View style={styles.right}>
                <Text style={styles.time}>
                  {record.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <CheckCircle2 size={16} color="#16a34a" />
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#9ca3af',
  },
  countText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  list: {
    maxHeight: 300,
  },
  empty: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f3ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
  },
  reg: {
    fontSize: 9,
    color: '#6b7280',
    fontWeight: '600',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  time: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '500',
  }
});
