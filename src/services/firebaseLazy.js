// Lazy Firebase initialization - only loads when actually needed
let firebasePromise = null;
let firebaseModules = null;

// Firebase configuration (loaded from environment variables)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

// Lazy load Firebase modules
export const getFirebase = async () => {
  if (firebaseModules) return firebaseModules;

  if (!firebasePromise) {
    firebasePromise = (async () => {
      const [
        { initializeApp },
        { getAuth },
        { getFirestore },
        { getStorage },
        { getFunctions }
      ] = await Promise.all([
        import('firebase/app'),
        import('firebase/auth'),
        import('firebase/firestore'),
        import('firebase/storage'),
        import('firebase/functions')
      ]);

      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const db = getFirestore(app);
      const storage = getStorage(app);
      const functions = getFunctions(app, 'us-central1');

      firebaseModules = { app, auth, db, storage, functions };
      return firebaseModules;
    })();
  }

  return firebasePromise;
};

// Get auth methods lazily
export const getAuthMethods = async () => {
  const [authModule, firebase] = await Promise.all([
    import('firebase/auth'),
    getFirebase()
  ]);

  return {
    auth: firebase.auth,
    onAuthStateChanged: authModule.onAuthStateChanged,
    signInWithEmailAndPassword: authModule.signInWithEmailAndPassword,
    createUserWithEmailAndPassword: authModule.createUserWithEmailAndPassword,
    signOut: authModule.signOut,
    sendPasswordResetEmail: authModule.sendPasswordResetEmail
  };
};

// Get Firestore methods lazily
export const getFirestoreMethods = async () => {
  const [firestoreModule, firebase] = await Promise.all([
    import('firebase/firestore'),
    getFirebase()
  ]);

  return {
    db: firebase.db,
    doc: firestoreModule.doc,
    getDoc: firestoreModule.getDoc,
    setDoc: firestoreModule.setDoc,
    serverTimestamp: firestoreModule.serverTimestamp
  };
};

// Stripe publishable key
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Probate form automation URL
export const PROBATE_FORMS_URL = import.meta.env.VITE_PROBATE_FORMS_URL || 'https://probatepetition.netlify.app';
