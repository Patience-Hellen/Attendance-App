import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { GraduationCap, UserCircle, Briefcase, Mail, Lock, Eye, EyeOff, LayoutGrid, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const JKUAT_LOGO = "https://www.jkuat.ac.ke/images/logo.png"; // Official JKUAT logo

type AuthMode = 'login' | 'signup' | 'forgot';

export default function Auth() {
  const { signInWithGoogle, signInWithEmail, signInAsGuest, signUpWithEmail, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<'student' | 'lecturer'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('John Dose');
  const [regNo, setRegNo] = useState('SCM211-0000/2022');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const defaultName = role === 'student' ? 'Demo Student' : 'Demo Lecturer';
      const safeEmailPrefix = email ? email.split('@')[0] : 'demo';
      const displayName = name || (role === 'student' ? (regNo || defaultName) : safeEmailPrefix);
      const safeRegNo = role === 'student' ? (regNo || 'SCM211-0000/2022') : undefined;

      // Permissive: try to sign in as guest
      await signInAsGuest(role, displayName, safeRegNo);
    } catch (err: any) {
      console.error(err);
      setError('Login failed. Please verify browser permissions or check if anonymous auth is enabled.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-4 font-sans selection:bg-indigo-100">
      <div className="max-w-md w-full">
        {/* Logo/Branding */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <img src={JKUAT_LOGO} alt="JKUAT Logo" className="h-24 w-auto object-contain drop-shadow-sm" />
            <div className="bg-[#002B5B] px-3 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-blue-100">
              JKUAT University
            </div>
            <h1 className="text-3xl font-extrabold text-[#1a202c] tracking-tight">Attendance Record</h1>
          </motion.div>
        </div>

        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 p-8 border border-white"
        >
          {/* Form Header */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Login</h2>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Enter details or just click login to proceed
            </p>
          </div>

          {/* Role Switcher */}
          <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-all ${
                role === 'student' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <UserCircle size={16} />
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole('lecturer')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-all ${
                role === 'lecturer' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Briefcase size={16} />
              Lecturer
            </button>
          </div>

          {/* Simple Form */}
          <form onSubmit={handleAuth} className="space-y-6">
            {role === 'student' ? (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Registration Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <GraduationCap size={18} />
                  </div>
                  <input
                    type="text"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    placeholder="SCMXXX-XXXX/20XX"
                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium uppercase"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@jkuat.ac.ke"
                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[11px] font-bold border border-red-100 flex items-center gap-3">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#002B5B] hover:bg-[#001f42] text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group text-lg"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                mode === 'login' ? 'Login' : mode === 'signup' ? 'Create Account' : 'Reset Password'
              )}
            </button>
          </form>

          {/* Footer Action */}
          <div className="mt-8 text-center space-y-4">
            <div className="flex items-center justify-center gap-4 text-sm font-medium text-gray-500">
              {mode === 'login' ? (
                <>
                  <button onClick={() => setMode('signup')} className="text-indigo-600 hover:underline">Sign Up</button>
                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                  <button onClick={() => setMode('forgot')} className="text-indigo-600 hover:underline">Forgot Password?</button>
                </>
              ) : (
                <button onClick={() => setMode('login')} className="text-indigo-600 hover:underline">Back to Login</button>
              )}
            </div>
          </div>
        </motion.div>

        <p className="mt-8 text-center text-xs text-gray-400 font-medium px-4">
          Accessing this portal requires authorization from JKUAT ICT department.
        </p>
      </div>
    </div>
  );
}

// Removed duplicate imports from bottom
