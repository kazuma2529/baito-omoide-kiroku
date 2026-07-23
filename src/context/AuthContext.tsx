import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { auth, googleProvider, hasValidConfig } from '../lib/firebase';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginDemoUser: () => void;
  logout: () => Promise<void>;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Check local storage for persistent demo user or custom session
    const savedDemoUser = localStorage.getItem('part_time_scrapbook_demo_user');

    if (hasValidConfig && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'ユーザー',
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            isDemo: false,
          });
        } else if (savedDemoUser) {
          try {
            setUser(JSON.parse(savedDemoUser));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Firebase not active, restore demo user if exists
      if (savedDemoUser) {
        try {
          setUser(JSON.parse(savedDemoUser));
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = async () => {
    setAuthError(null);
    if (hasValidConfig && auth && googleProvider) {
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (err: any) {
        console.error('Google Sign In Error:', err);
        setAuthError('ログインに失敗しました。もう一度お試しください。');
      }
    } else {
      // Fallback Google Login mock
      loginDemoUser();
    }
  };

  const loginDemoUser = () => {
    const demoUser: UserProfile = {
      uid: 'demo-user-id',
      displayName: '山田 太郎',
      email: 'kyamada760@gmail.com',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      isDemo: true,
    };
    localStorage.setItem('part_time_scrapbook_demo_user', JSON.stringify(demoUser));
    setUser(demoUser);
    setAuthError(null);
  };

  const logout = async () => {
    setAuthError(null);
    localStorage.removeItem('part_time_scrapbook_demo_user');
    if (hasValidConfig && auth) {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        console.error('Sign Out Error:', err);
      }
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginDemoUser, logout, authError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
