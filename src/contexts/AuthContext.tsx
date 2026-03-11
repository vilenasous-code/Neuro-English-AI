import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from '../mockFirebase';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestore';

export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userLevel: string;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
  updateLevel: (level: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLevel, setUserLevel] = useState('B1'); // Default level

  useEffect(() => {
    // Check local storage for existing guest session
    const guestUid = localStorage.getItem('guest_uid');
    if (guestUid) {
      const currentUser = { 
        uid: guestUid, 
        email: 'guest@neuroenglish.ai',
        displayName: 'Guest Learner'
      };
      setUser(currentUser);
      
      // Fetch user level
      getDoc(doc(db, 'users', guestUid)).then(userDoc => {
        if (userDoc.exists()) {
          setUserLevel(userDoc.data().level || 'B1');
        }
      }).catch(console.error).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async () => {
    try {
      let guestUid = localStorage.getItem('guest_uid');
      if (!guestUid) {
        guestUid = 'guest_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('guest_uid', guestUid);
      }
      
      const currentUser = { 
        uid: guestUid, 
        email: 'guest@neuroenglish.ai',
        displayName: 'Guest Learner'
      };
      setUser(currentUser);
      
      // Create or fetch profile
      const userDoc = await getDoc(doc(db, 'users', guestUid));
      if (userDoc.exists()) {
        setUserLevel(userDoc.data().level || 'B1');
      } else {
        await setDoc(doc(db, 'users', guestUid), {
          uid: guestUid,
          email: currentUser.email,
          level: 'B1',
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error starting session', error);
      throw error;
    }
  };

  const logOut = async () => {
    localStorage.removeItem('guest_uid');
    setUser(null);
  };

  const updateLevel = async (level: string) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), { level }, { merge: true });
      setUserLevel(level);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, userLevel, signIn, logOut, updateLevel }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
