import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import {
  GraduationCap,
  UserCircle,
  Briefcase,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const JKUAT_LOGO = "https://www.jkuat.ac.ke/images/logo.png";

type AuthMode = 'login' | 'signup' | 'forgot';

export default function Auth() {
  const { signInAsGuest, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<'student' | 'lecturer'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('John Doe');
  const [regNo, setRegNo] = useState('SCM211-0000/2022');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    setError('');
    
    try {
      const displayName = name || (role === 'student' ? (regNo || 'Demo Student') : (email.split('@')[0] || 'Demo Lecturer'));
      const safeRegNo = role === 'student' ? (regNo || 'SCM211-0000/2022') : undefined;

      if (mode === 'login' || mode === 'signup') {
        await signInAsGuest(role, displayName, safeRegNo);
      } else if (mode === 'forgot') {
        await resetPassword(email || 'demo@jkuat.ac.ke');
        setSuccess('Reset instructions sent (Demo mode)');
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err: any) {
      console.error(err);
      setError('Login failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Logo/Branding */}
        <View style={styles.header}>
          <Image source={{ uri: JKUAT_LOGO }} style={styles.logo} resizeMode="contain" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>JKUAT UNIVERSITY</Text>
          </View>
          <Text style={styles.title}>Attendance Record</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{mode === 'login' ? 'Login' : mode === 'signup' ? 'Sign Up' : 'Reset Password'}</Text>
            <Text style={styles.cardSubtitle}>Enter details or just click login to proceed</Text>
          </View>

          {/* Role Switcher */}
          <View style={styles.roleSwitcher}>
            <TouchableOpacity 
              onPress={() => setRole('student')}
              style={[styles.roleButton, role === 'student' && styles.roleButtonActive]}
            >
              <UserCircle size={16} color={role === 'student' ? '#4f46e5' : '#6b7280'} />
              <Text style={[styles.roleButtonText, role === 'student' && styles.roleButtonTextActive]}>Student</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setRole('lecturer')}
              style={[styles.roleButton, role === 'lecturer' && styles.roleButtonActive]}
            >
              <Briefcase size={16} color={role === 'lecturer' ? '#4f46e5' : '#6b7280'} />
              <Text style={[styles.roleButtonText, role === 'lecturer' && styles.roleButtonTextActive]}>Lecturer</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {mode === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>FULL NAME</Text>
                <TextInput
                  placeholder="Hellen Patience"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                />
              </View>
            )}

            {role === 'student' ? (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>REGISTRATION NUMBER</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <GraduationCap size={18} color="#9ca3af" />
                  </View>
                  <TextInput
                    placeholder="SCMXXX-XXXX/20XX"
                    value={regNo}
                    onChangeText={setRegNo}
                    autoCapitalize="characters"
                    style={[styles.input, { paddingLeft: 45 }]}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>EMAIL ADDRESS</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <Mail size={18} color="#9ca3af" />
                  </View>
                  <TextInput
                    placeholder="name@jkuat.ac.ke"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={[styles.input, { paddingLeft: 45 }]}
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIcon}>
                  <Lock size={18} color="#9ca3af" />
                </View>
                <TextInput
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={[styles.input, { paddingLeft: 45, paddingRight: 45 }]}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  {showPassword ? <EyeOff size={18} color="#9ca3af" /> : <Eye size={18} color="#9ca3af" />}
                </TouchableOpacity>
              </View>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <AlertCircle size={16} color="#dc2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {success ? (
              <View style={styles.successBox}>
                <CheckCircle2 size={16} color="#16a34a" />
                <Text style={styles.successText}>{success}</Text>
              </View>
            ) : null}

            <TouchableOpacity 
              onPress={handleAuth} 
              disabled={loading}
              style={styles.submitButton}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {mode === 'login' ? 'Login' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            {mode === 'login' ? (
              <View style={styles.footerLinks}>
                <TouchableOpacity onPress={() => setMode('signup')}>
                  <Text style={styles.linkText}>Sign Up</Text>
                </TouchableOpacity>
                <View style={styles.dot} />
                <TouchableOpacity onPress={() => setMode('forgot')}>
                  <Text style={styles.linkText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setMode('login')}>
                <Text style={styles.linkText}>Back to Login</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.disclaimer}>
          Accessing this portal requires authorization from JKUAT ICT department.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    height: 80,
    width: 200,
    marginBottom: 15,
  },
  badge: {
    backgroundColor: '#002B5B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a202c',
    letterSpacing: -0.5,
  },
  card: {
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 400,
    borderRadius: 30,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#fff',
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 25,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 5,
    textAlign: 'center',
  },
  roleSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 4,
    borderRadius: 15,
    marginBottom: 25,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  roleButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  roleButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  roleButtonTextActive: {
    color: '#4f46e5',
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
    letterSpacing: 1.5,
    marginLeft: 4,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    zIndex: 10,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    zIndex: 10,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  submitButton: {
    backgroundColor: '#002B5B',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#002B5B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 11,
    fontWeight: 'bold',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  successText: {
    color: '#16a34a',
    fontSize: 11,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 25,
    alignItems: 'center',
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  linkText: {
    color: '#4f46e5',
    fontSize: 14,
    fontWeight: '600',
  },
  dot: {
    width: 4,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
  },
  disclaimer: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
    paddingHorizontal: 20,
    lineHeight: 18,
  }
});
