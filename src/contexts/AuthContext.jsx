import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { isFirebaseConfigured, getAuthMethods, getFirestoreMethods } from '../services/firebaseLazy';

const AuthContext = createContext({});

// Admin emails that have access to admin dashboard
const ADMIN_EMAILS = ['rozsagyenelaw@yahoo.com', 'rozsagyenelaw1@gmail.com'];

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false); // Start with false for instant render
  const [isAdmin, setIsAdmin] = useState(false);
  const [firebaseReady, setFirebaseReady] = useState(false);
  const authMethodsRef = useRef(null);
  const firestoreMethodsRef = useRef(null);
  const unsubscribeRef = useRef(null);

  // Initialize Firebase lazily
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    let mounted = true;

    const initFirebase = async () => {
      try {
        // Load Firebase in background
        const authMethods = await getAuthMethods();
        if (!mounted) return;

        authMethodsRef.current = authMethods;
        setFirebaseReady(true);

        // Set up auth state listener
        unsubscribeRef.current = authMethods.onAuthStateChanged(authMethods.auth, async (firebaseUser) => {
          if (!mounted) return;

          if (firebaseUser) {
            setUser(firebaseUser);
            setIsAdmin(ADMIN_EMAILS.includes(firebaseUser.email));

            // Load profile in background
            try {
              const fsModule = await getFirestoreMethods();
              if (!mounted) return;
              firestoreMethodsRef.current = fsModule;

              const userDoc = await fsModule.getDoc(fsModule.doc(fsModule.db, 'users', firebaseUser.uid));
              if (userDoc.exists() && mounted) {
                setUserProfile({ id: userDoc.id, ...userDoc.data() });
              }
            } catch (err) {
              console.warn('Profile load error:', err);
            }
          } else {
            setUser(null);
            setUserProfile(null);
            setIsAdmin(false);
          }
          setLoading(false);
        });
      } catch (err) {
        console.error('Firebase init error:', err);
        if (mounted) setLoading(false);
      }
    };

    initFirebase();

    return () => {
      mounted = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const authMethods = authMethodsRef.current || await getAuthMethods();
      authMethodsRef.current = authMethods;
      const result = await authMethods.signInWithEmailAndPassword(authMethods.auth, email, password);
      return result.user;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, []);

  // Register function
  const register = useCallback(async (email, password, additionalData = {}) => {
    setLoading(true);
    try {
      const [authMethods, fsModule] = await Promise.all([
        authMethodsRef.current ? Promise.resolve(authMethodsRef.current) : getAuthMethods(),
        firestoreMethodsRef.current ? Promise.resolve(firestoreMethodsRef.current) : getFirestoreMethods()
      ]);
      authMethodsRef.current = authMethods;
      firestoreMethodsRef.current = fsModule;

      const result = await authMethods.createUserWithEmailAndPassword(authMethods.auth, email, password);

      // Create user document in Firestore
      await fsModule.setDoc(fsModule.doc(fsModule.db, 'users', result.user.uid), {
        uid: result.user.uid,
        email: result.user.email,
        firstName: additionalData.firstName || '',
        lastName: additionalData.lastName || '',
        phone: additionalData.phone || '',
        createdAt: fsModule.serverTimestamp(),
        updatedAt: fsModule.serverTimestamp()
      });

      return result.user;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    const authMethods = authMethodsRef.current || await getAuthMethods();
    await authMethods.signOut(authMethods.auth);
    setUser(null);
    setUserProfile(null);
    setIsAdmin(false);
  }, []);

  // Password reset function
  const resetPassword = useCallback(async (email) => {
    const authMethods = authMethodsRef.current || await getAuthMethods();
    await authMethods.sendPasswordResetEmail(authMethods.auth, email);
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (data) => {
    if (!user) return;

    const fsModule = firestoreMethodsRef.current || await getFirestoreMethods();
    firestoreMethodsRef.current = fsModule;

    const userRef = fsModule.doc(fsModule.db, 'users', user.uid);
    await fsModule.setDoc(userRef, {
      ...data,
      updatedAt: fsModule.serverTimestamp()
    }, { merge: true });

    // Refresh local profile
    const updatedDoc = await fsModule.getDoc(userRef);
    if (updatedDoc.exists()) {
      setUserProfile({ id: updatedDoc.id, ...updatedDoc.data() });
    }
  }, [user]);

  const value = {
    user,
    userProfile,
    loading,
    isAdmin,
    firebaseReady,
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
