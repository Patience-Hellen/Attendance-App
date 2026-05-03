import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp,
  orderBy,
  collectionGroup
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from './useAuth';
import { GeoLocation } from '../utils/geo';

export interface Session {
  id: string;
  courseCode: string;
  lecturerId: string;
  lecturerName: string;
  location: GeoLocation;
  radius: number;
  isActive: boolean;
  startTime: any;
  endTime?: any;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  courseCode?: string;
  lecturerName?: string;
  regNo?: string;
  timestamp: any;
  status: string;
  location: GeoLocation;
}

// Mock Data for visualization
const MOCK_SESSIONS: Session[] = [
  {
    id: 'mock-1',
    courseCode: 'BIT 2102',
    lecturerId: 'mock-lec',
    lecturerName: 'Dr. Kamau',
    location: { latitude: -1.0912, longitude: 37.0117 },
    radius: 50,
    isActive: true,
    startTime: { toDate: () => new Date(Date.now() - 3600000) }
  },
  {
    id: 'mock-2',
    courseCode: 'SCS 2204',
    lecturerId: 'mock-lec',
    lecturerName: 'Dr. Kamau',
    location: { latitude: -1.0922, longitude: 37.0127 },
    radius: 30,
    isActive: true,
    startTime: { toDate: () => new Date(Date.now() - 7200000) }
  }
];

const MOCK_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    sessionId: 'mock-1',
    studentId: 'std-1',
    studentName: 'John Dose',
    courseCode: 'BIT 2102',
    lecturerName: 'Dr. Kamau',
    regNo: 'SCM211-0000/2022',
    timestamp: { toDate: () => new Date(Date.now() - 1800000) },
    status: 'Present',
    location: { latitude: -1.0913, longitude: 37.0118 }
  },
  {
    id: 'att-2',
    sessionId: 'mock-1',
    studentId: 'std-2',
    studentName: 'Jane Smith',
    courseCode: 'BIT 2102',
    lecturerName: 'Dr. Kamau',
    regNo: 'SCM211-0001/2022',
    timestamp: { toDate: () => new Date(Date.now() - 1200000) },
    status: 'Present',
    location: { latitude: -1.0911, longitude: 37.0116 }
  }
];

export function useAttendance() {
  const { profile } = useAuth();
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [myAttendance, setMyAttendance] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);
  const [sessionAttendance, setSessionAttendance] = useState<AttendanceRecord[]>([]);

  // Listen for active sessions
  useEffect(() => {
    if (!profile) return;

    const q = query(
      collection(db, 'sessions'),
      where('isActive', '==', true),
      orderBy('startTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session));
        // Combine with mock data if none exist for demo
        setActiveSessions(sessions.length > 0 ? sessions : MOCK_SESSIONS);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'sessions');
        setActiveSessions(MOCK_SESSIONS); // Fallback to mock on error
      }
    );

    return () => unsubscribe();
  }, [profile]);

  // Listen for my attendance history
  useEffect(() => {
    if (!profile || profile.role !== 'student') return;

    try {
      const q = query(
        collectionGroup(db, 'attendance'),
        where('studentId', '==', profile.uid),
        orderBy('timestamp', 'desc')
      );

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
          setMyAttendance(records.length > 0 ? records : MOCK_ATTENDANCE);
        },
        (error) => {
          console.warn("History fetch failed - showing mock data instead", error);
          setMyAttendance(MOCK_ATTENDANCE);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.error("CollectionGroup query setup failed", e);
    }
  }, [profile]);

  const createSession = async (courseCode: string, location: GeoLocation, radius: number) => {
    if (!profile || profile.role !== 'lecturer') return;

    const sessionData = {
      courseCode,
      lecturerId: profile.uid,
      lecturerName: profile.name,
      location,
      radius,
      isActive: true,
      startTime: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, 'sessions'), sessionData);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'sessions');
    }
  };

  const endSession = async (sessionId: string) => {
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      await updateDoc(sessionRef, {
        isActive: false,
        endTime: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `sessions/${sessionId}`);
    }
  };

  const markAttendance = async (session: Session, location: GeoLocation) => {
    if (!profile || profile.role !== 'student') return;

    const attendanceData = {
      sessionId: session.id,
      courseCode: session.courseCode,
      lecturerName: session.lecturerName,
      studentId: profile.uid,
      studentName: profile.name,
      regNo: profile.regNo || '',
      timestamp: serverTimestamp(),
      status: 'Present',
      location,
    };

    try {
      await addDoc(collection(db, `sessions/${session.id}/attendance`), attendanceData);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `sessions/${session.id}/attendance`);
    }
  };

  const listenToSessionAttendance = (sessionId: string) => {
    // If it's a mock session, return mock data
    if (sessionId.startsWith('mock-')) {
      setSessionAttendance(MOCK_ATTENDANCE.filter(a => a.sessionId === sessionId));
      return () => {};
    }

    const q = query(
      collection(db, `sessions/${sessionId}/attendance`),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(q, 
      (snapshot) => {
        const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
        setSessionAttendance(records);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, `sessions/${sessionId}/attendance`)
    );
  };

  return {
    activeSessions,
    myAttendance,
    sessionAttendance,
    createSession,
    endSession,
    markAttendance,
    listenToSessionAttendance,
  };
}
