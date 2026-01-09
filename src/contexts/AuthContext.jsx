import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext({});

// Admin emails that have access to admin dashboard
const ADMIN_EMAILS = ['rozsagyenelaw@yahoo.com', 'rozsagyenelaw1@gmail.com'];

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // If auth is not available, stop loading
    if (!auth) {
      setLoading(false);
      return;
    }

    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.warn('Auth timeout - setting loading to false');
      setLoading(false);
    }, 5000); // 5 second timeout

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeout);

      if (firebaseUser) {
        setUser(firebaseUser);
        const userIsAdmin = ADMIN_EMAILS.includes(firebaseUser.email);
        setIsAdmin(userIsAdmin);

        // Load user profile from Firestore (don't block on this)
        if (db) {
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              setUserProfile({ id: userDoc.id, ...userDoc.data() });
            }
          } catch (error) {
            console.error('Error loading user profile:', error);
            // Don't block - user can still use the app
          }
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  // Register function
  const register = async (email, password, additionalData = {}) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Create user document in Firestore
    await setDoc(doc(db, 'users', result.user.uid), {
      uid: result.user.uid,
      email: result.user.email,
      firstName: additionalData.firstName || '',
      lastName: additionalData.lastName || '',
      phone: additionalData.phone || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return result.user;
  };

  // Logout function
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
    setIsAdmin(false);
  };

  // Password reset function
  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  // Update user profile
  const updateProfile = async (data) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Refresh local profile
    const updatedDoc = await getDoc(userRef);
    if (updatedDoc.exists()) {
      setUserProfile({ id: updatedDoc.id, ...updatedDoc.data() });
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    isAdmin,
    login,
    register,
    logout,
    resetPassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
