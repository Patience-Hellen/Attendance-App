import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Auth from './components/Auth';
import LecturerDashboard from './components/LecturerDashboard';
import StudentDashboard from './components/StudentDashboard';
import { LogOut, GraduationCap, MapPin } from 'lucide-react';

function AppContent() {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading JKUAT Geofence...</Text>
      </View>
    );
  }

  if (!user || !profile) {
    return <Auth />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.brand}>
            <View style={styles.brandIcon}>
              <GraduationCap size={20} color="#fff" />
            </View>
            <View>
              <Text style={styles.brandTitle}>JKUAT Attendance</Text>
              <View style={styles.geofenceBadge}>
                <MapPin size={10} color="#4f46e5" />
                <Text style={styles.geofenceText}>GEOFENCED SYSTEM</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
            <LogOut size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.main}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{profile.name}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{profile.role.toUpperCase()}</Text>
            </View>
          </View>

          {profile.role === 'lecturer' ? (
            <LecturerDashboard />
          ) : (
            <StudentDashboard />
          )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 JKUAT Geofence Attendance</Text>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingVertical: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'between',
    paddingHorizontal: 20,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandIcon: {
    backgroundColor: '#002B5B',
    padding: 8,
    borderRadius: 10,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  geofenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  geofenceText: {
    fontSize: 8,
    color: '#4f46e5',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
  },
  main: {
    padding: 20,
    paddingBottom: 40,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'between',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  roleBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '900',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
  }
});
