import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Check if Firebase keys are configured
const hasFirebaseKeys = 
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_APP_ID &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Only initialize Firebase if keys are present
let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;

if (hasFirebaseKeys) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  console.warn('Firebase configuration keys not found. Please add VITE_FIREBASE_API_KEY, VITE_FIREBASE_APP_ID, and VITE_FIREBASE_PROJECT_ID to your environment.');
}

export { auth, db, storage };
export default app;
