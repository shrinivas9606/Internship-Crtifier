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

console.log('=== Firebase Initialization ===');
console.log('Has Firebase Keys:', hasFirebaseKeys);
console.log('API Key exists:', !!import.meta.env.VITE_FIREBASE_API_KEY);
console.log('App ID exists:', !!import.meta.env.VITE_FIREBASE_APP_ID);
console.log('Project ID exists:', !!import.meta.env.VITE_FIREBASE_PROJECT_ID);
console.log('Project ID value:', import.meta.env.VITE_FIREBASE_PROJECT_ID);

if (hasFirebaseKeys) {
  try {
    console.log('Initializing Firebase with config:', firebaseConfig);
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log('✅ Firebase initialized successfully');
    console.log('Auth:', auth);
    console.log('DB:', db);
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
  }
} else {
  console.error('❌ Firebase configuration keys not found. Missing environment variables.');
}

export { auth, db, storage };
export default app;
