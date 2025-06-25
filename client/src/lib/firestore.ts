import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  updateDoc,
  increment 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";
import type { 
  UserSettings, 
  InsertUserSettings, 
  Intern, 
  InsertIntern,
  CertificateVerification 
} from "@shared/schema";
import { v4 as uuidv4 } from "uuid";

// Debug Firebase configuration
console.log('Firestore db object:', db);
console.log('Firebase config check:', {
  hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
  hasAppId: !!import.meta.env.VITE_FIREBASE_APP_ID,
  hasProjectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
});

// User Settings
export async function saveUserSettings(settings: InsertUserSettings): Promise<void> {
  if (!db) {
    throw new Error('Firestore not initialized. Check Firebase configuration.');
  }
  
  try {
    const userRef = doc(db, "userSettings", settings.uid);
    await setDoc(userRef, {
      ...settings,
      setupCompleted: true,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Error saving user settings:', error);
    throw error;
  }
}

export async function getUserSettings(uid: string): Promise<UserSettings | null> {
  console.log('=== getUserSettings called ===');
  console.log('UID:', uid);
  console.log('DB object:', db);
  console.log('DB is null?', db === null);
  
  if (!db) {
    console.error('❌ Firestore not initialized! Check Firebase configuration.');
    console.log('Environment check:', {
      VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ? 'EXISTS' : 'MISSING',
      VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID ? 'EXISTS' : 'MISSING', 
      VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'EXISTS' : 'MISSING'
    });
    return null;
  }
  
  try {
    console.log('✅ Firestore initialized, fetching user settings...');
    const userRef = doc(db, "userSettings", uid);
    console.log('Document reference created:', userRef);
    
    const userSnap = await getDoc(userRef);
    console.log('Document snapshot retrieved:', userSnap);
    console.log('Document exists:', userSnap.exists());
    
    if (userSnap.exists()) {
      const data = userSnap.data() as UserSettings;
      console.log('✅ User settings found:', data);
      return data;
    } else {
      console.log('⚠️ No user settings document found - user needs to complete setup');
      return null;
    }
  } catch (error: any) {
    console.error('❌ Error getting user settings:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'permission-denied') {
      console.error('🔒 Permission denied - check Firestore security rules');
    }
    return null;
  }
}

// File Upload - No longer needed since we use data URLs
// This function is kept for compatibility but not used
export async function uploadFile(file: File, path: string): Promise<string> {
  // Convert to data URL instead of uploading to Firebase Storage
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Interns
export async function addIntern(internData: InsertIntern): Promise<string> {
  if (!db) {
    throw new Error('Firestore not initialized. Check Firebase configuration.');
  }
  
  try {
    const id = uuidv4();
    const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const intern: Omit<Intern, 'createdAt'> = {
      ...internData,
      id,
      certificateId,
    };

    await setDoc(doc(db, "interns", id), {
      ...intern,
      createdAt: new Date(),
    });

    // Create verification record
    await setDoc(doc(db, "verifications", certificateId), {
      certificateId,
      internId: id,
      verificationCount: 0,
      lastVerified: new Date(),
    });

    return certificateId;
  } catch (error) {
    console.error('Error adding intern:', error);
    throw error;
  }
}

export async function getInternsByUser(uid: string): Promise<Intern[]> {
  if (!db) {
    console.warn('Firestore not initialized, returning empty array');
    return [];
  }
  
  try {
    console.log('Fetching interns for user:', uid);
    
    // First, try a simple query without orderBy to test connection
    const q = query(
      collection(db, "interns"),
      where("createdBy", "==", uid)
    );
    
    const querySnapshot = await getDocs(q);
    console.log('Query executed successfully, found docs:', querySnapshot.size);
    
    const interns = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Intern doc data:', data);
      return data as Intern;
    });
    
    // Sort by createdAt on client side since we removed orderBy
    return interns.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
    
  } catch (error: any) {
    console.error('Error getting interns:', error);
    
    // More specific error handling
    if (error.code === 'failed-precondition') {
      console.error('Firestore indexes may be missing. Trying simpler query...');
      try {
        // Fallback: get all documents from collection without where clause
        const simpleQuery = collection(db, "interns");
        const snapshot = await getDocs(simpleQuery);
        console.log('Simple query worked, total docs:', snapshot.size);
        
        return snapshot.docs
          .map(doc => doc.data() as Intern)
          .filter(intern => intern.createdBy === uid)
          .sort((a, b) => {
            const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
            const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
          });
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        return [];
      }
    }
    
    return [];
  }
}

export async function getInternByCertificateId(certificateId: string): Promise<{ intern: Intern; userSettings: UserSettings } | null> {
  if (!db) {
    throw new Error('Firestore not initialized. Check Firebase configuration.');
  }

  try {
    // Get verification record first
    const verificationRef = doc(db, "verifications", certificateId);
    const verificationSnap = await getDoc(verificationRef);
    
    if (!verificationSnap.exists()) {
      return null;
    }

    const verification = verificationSnap.data() as CertificateVerification;
    
    // Update verification count
    await updateDoc(verificationRef, {
      verificationCount: increment(1),
      lastVerified: new Date(),
    });

    // Get intern data
    const internRef = doc(db, "interns", verification.internId);
    const internSnap = await getDoc(internRef);
    
    if (!internSnap.exists()) {
      return null;
    }

    const intern = internSnap.data() as Intern;

    // Get user settings for the creator
    const userSettings = await getUserSettings(intern.createdBy);
    
    if (!userSettings) {
      return null;
    }

    return { intern, userSettings };
  } catch (error) {
    console.error('Error getting intern by certificate ID:', error);
    throw error;
  }
}

// Dashboard Stats
export async function getDashboardStats(uid: string) {
  if (!db) {
    console.warn('Firestore not initialized, returning default stats');
    return {
      totalInterns: 0,
      generatedCerts: 0,
      verifications: 0,
      activeInternships: 0,
    };
  }

  try {
    const interns = await getInternsByUser(uid);
    
    const totalInterns = interns.length;
    const completedInterns = interns.filter(intern => intern.status === "completed").length;
    const activeInternships = interns.filter(intern => intern.status === "active").length;

    // Get total verifications (simplified - in real app you'd aggregate from all certificates)
    let totalVerifications = 0;
    for (const intern of interns) {
      try {
        const verificationRef = doc(db, "verifications", intern.certificateId);
        const verificationSnap = await getDoc(verificationRef);
        if (verificationSnap.exists()) {
          totalVerifications += verificationSnap.data().verificationCount || 0;
        }
      } catch (error) {
        console.warn('Error getting verification count for intern:', intern.id);
      }
    }

    return {
      totalInterns,
      generatedCerts: completedInterns,
      verifications: totalVerifications,
      activeInternships,
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return {
      totalInterns: 0,
      generatedCerts: 0,
      verifications: 0,
      activeInternships: 0,
    };
  }
}
