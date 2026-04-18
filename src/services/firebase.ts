import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Safely try to load config
let firebaseConfig: any = null;
try {
  // We use require/dynamic import to avoid build errors if file is missing
  firebaseConfig = require('../../firebase-applet-config.json');
} catch (e) {
  console.warn("Firebase config not found. App running in Smart-Local mode.");
}

export const app = firebaseConfig ? initializeApp(firebaseConfig) : null;
export const db = app ? getFirestore(app, firebaseConfig.firestoreDatabaseId) : null;
export const auth = app ? getAuth(app) : null;
export const isCloudEnabled = !!app;
