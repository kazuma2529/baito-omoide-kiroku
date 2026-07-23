import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

import firebaseAppletConfig from '../../firebase-applet-config.json';

interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  firestoreDatabaseId?: string;
}

let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let googleProvider: GoogleAuthProvider | null = null;

// Read environment variables or config JSON
const metaEnv = (import.meta as any).env || {};
const procEnv = (typeof process !== 'undefined' && process.env) || {};

const config: FirebaseConfig = {
  apiKey: firebaseAppletConfig?.apiKey || metaEnv.VITE_FIREBASE_API_KEY || procEnv.VITE_FIREBASE_API_KEY,
  authDomain: firebaseAppletConfig?.authDomain || metaEnv.VITE_FIREBASE_AUTH_DOMAIN || procEnv.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: firebaseAppletConfig?.projectId || metaEnv.VITE_FIREBASE_PROJECT_ID || procEnv.VITE_FIREBASE_PROJECT_ID,
  storageBucket: firebaseAppletConfig?.storageBucket || metaEnv.VITE_FIREBASE_STORAGE_BUCKET || procEnv.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: firebaseAppletConfig?.messagingSenderId || metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || procEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: firebaseAppletConfig?.appId || metaEnv.VITE_FIREBASE_APP_ID || procEnv.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: firebaseAppletConfig?.firestoreDatabaseId || metaEnv.VITE_FIREBASE_DATABASE_ID || procEnv.VITE_FIREBASE_DATABASE_ID,
};

// Check if valid config exists
const hasValidConfig = Boolean(config.apiKey && config.projectId);

if (hasValidConfig) {
  try {
    if (!getApps().length) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApps()[0];
    }
    auth = getAuth(firebaseApp);
    db = config.firestoreDatabaseId
      ? getFirestore(firebaseApp, config.firestoreDatabaseId)
      : getFirestore(firebaseApp);
    storage = getStorage(firebaseApp);
    googleProvider = new GoogleAuthProvider();
  } catch (err) {
    console.warn('Firebase initialization error, falling back to local mode:', err);
  }
} else {
  console.info('Firebase config environment variables not fully set. Running in local persistence mode.');
}

export { firebaseApp, auth, db, storage, googleProvider, hasValidConfig };
