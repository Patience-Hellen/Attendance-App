import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signInAnonymously
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'student' | 'lecturer';
  regNo?: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: (role: 'student' | 'lecturer', regNo?: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signInAsGuest: (role: 'student' | 'lecturer', customName?: string, customRegNo?: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, role: 'student' | 'lecturer', regNo?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (role: 'student' | 'lecturer', regNo?: string) => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      const newProfile: UserProfile = {
        uid: user.uid,
        name: user.displayName || 'Anonymous',
        email: user.email || '',
        role: role,
        regNo: regNo || '',
      };
      await setDoc(docRef, {
        ...newProfile,
        createdAt: serverTimestamp(),
      });
      setProfile(newProfile);
    } else {
      setProfile(docSnap.data() as UserProfile);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    const docRef = doc(db, 'users', result.user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setProfile(docSnap.data() as UserProfile);
    } else {
      // Profile missing - this might happen if registration crashed or rules were broken
      // We throw a specific error that the UI can catch to offer recovery/auto-signup
      const error = new Error('Profile missing');
      (error as any).code = 'auth/profile-missing';
      (error as any).uid = result.user.uid;
      throw error;
    }
  };

  const signInAsGuest = async (role: 'student' | 'lecturer', customName?: string, customRegNo?: string) => {
    try {
      const result = await signInAnonymously(auth);
      const user = result.user;
      
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        const newProfile: UserProfile = {
          uid: user.uid,
          name: customName || `Guest ${role === 'student' ? 'Student' : 'Lecturer'}`,
          email: `guest_${user.uid.slice(0, 5)}@guest.local`,
          role,
          regNo: customRegNo || (role === 'student' ? `GUEST-${user.uid.slice(0, 4).toUpperCase()}` : ''),
        };
        try {
          await setDoc(docRef, {
            ...newProfile,
            createdAt: serverTimestamp(),
          });
        } catch (e) {
          console.warn("Firestore write failed, but proceeding with local profile", e);
        }
        setProfile(newProfile);
      } else {
        setProfile(docSnap.data() as UserProfile);
      }
    } catch (err: any) {
      console.warn("Firebase Auth blocked or misconfigured. Bypassing with dummy session.", err);
      // Dummy bypass
      const dummyUid = "guest_" + Math.random().toString(36).substr(2, 9);
      const dummyUser = { uid: dummyUid, isAnonymous: true } as any;
      const dummyProfile: UserProfile = {
        uid: dummyUid,
        name: customName || `Guest ${role === 'student' ? 'Student' : 'Lecturer'}`,
        email: `guest@guest.net`,
        role,
        regNo: customRegNo || (role === 'student' ? 'SCM211-0000/2022' : ''),
      };
      setUser(dummyUser);
      setProfile(dummyProfile);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, role: 'student' | 'lecturer', regNo?: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(result.user, { displayName: name });
    
    const newProfile: UserProfile = {
      uid: result.user.uid,
      name,
      email,
      role,
      regNo: regNo || '',
    };
    
    await setDoc(doc(db, 'users', result.user.uid), {
      ...newProfile,
      createdAt: serverTimestamp(),
    });
    setProfile(newProfile);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signInWithEmail, signInAsGuest, signUpWithEmail, resetPassword, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
