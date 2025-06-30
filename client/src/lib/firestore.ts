import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  updateDoc,
  increment,
  Timestamp
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

// Utility function to parse date strings in YYYY-MM-DD format
const parseDateString = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Convert to Firestore Timestamp (handles both Date objects and YYYY-MM-DD strings)
const toFirestoreDate = (date: Date | string): Timestamp => {
  if (typeof date === 'string') {
    return Timestamp.fromDate(parseDateString(date));
  }
  return Timestamp.fromDate(date);
};

// Convert Firestore data to YYYY-MM-DD string
export const firestoreToDateString = (timestamp: Timestamp | Date | string): string => {
  let date: Date;
  
  if (timestamp instanceof Timestamp) {
    date = timestamp.toDate();
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else {
    date = timestamp;
  }

  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// User Settings
export async function saveUserSettings(settings: InsertUserSettings): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');
  
  try {
    await setDoc(doc(db, "userSettings", settings.uid), {
      ...settings,
      setupCompleted: true,
      createdAt: Timestamp.now(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving user settings:', error);
    throw error;
  }
}

export async function getUserSettings(uid: string): Promise<UserSettings | null> {
  if (!db) {
    console.error('Firestore not initialized');
    return null;
  }
  
  try {
    const userSnap = await getDoc(doc(db, "userSettings", uid));
    return userSnap.exists() ? userSnap.data() as UserSettings : null;
  } catch (error) {
    console.error('Error getting user settings:', error);
    return null;
  }
}

// File Upload
export async function uploadFile(file: File, path: string): Promise<string> {
  if (!storage) throw new Error('Storage not initialized');
  
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// Interns
export async function addIntern(internData: InsertIntern): Promise<string> {
  if (!db) throw new Error('Firestore not initialized');
  
  try {
    // Validate date format if strings are provided
    if (typeof internData.startDate === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(internData.startDate)) {
      throw new Error('Start date must be in YYYY-MM-DD format');
    }
    if (typeof internData.endDate === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(internData.endDate)) {
      throw new Error('End date must be in YYYY-MM-DD format');
    }

    const id = uuidv4();
    const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    await setDoc(doc(db, "interns", id), {
      ...internData,
      id,
      certificateId,
      startDate: toFirestoreDate(internData.startDate),
      endDate: toFirestoreDate(internData.endDate),
      createdAt: Timestamp.now(),
    });

    await setDoc(doc(db, "verifications", certificateId), {
      certificateId,
      internId: id,
      verificationCount: 0,
      lastVerified: Timestamp.now(),
    });

    return certificateId;
  } catch (error) {
    console.error('Error adding intern:', error);
    throw error;
  }
}

export async function getInternsByUser(uid: string): Promise<Intern[]> {
  if (!db) {
    console.warn('Firestore not initialized');
    return [];
  }
  
  try {
    const q = query(collection(db, "interns"), where("createdBy", "==", uid));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data() as Intern;
      return {
        ...data,
        // Convert Firestore Timestamps to date strings for startDate and endDate,
        // but keep createdAt as a Date object
        startDate: firestoreToDateString(data.startDate),
        endDate: firestoreToDateString(data.endDate),
        createdAt: data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : (typeof data.createdAt === "string"
              ? new Date(data.createdAt)
              : data.createdAt)
      };
    }).sort((a, b) => {
      const dateA = a.createdAt.getTime();
      const dateB = b.createdAt.getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error getting interns:', error);
    return [];
  }
}

export async function getInternByCertificateId(certificateId: string): Promise<{ intern: Intern; userSettings: UserSettings } | null> {
  if (!db) throw new Error('Firestore not initialized');

  try {
    const verificationRef = doc(db, "verifications", certificateId);
    const verificationSnap = await getDoc(verificationRef);
    
    if (!verificationSnap.exists()) return null;

    await updateDoc(verificationRef, {
      verificationCount: increment(1),
      lastVerified: Timestamp.now(),
    });

    const internRef = doc(db, "interns", verificationSnap.data().internId);
    const internSnap = await getDoc(internRef);
    
    if (!internSnap.exists()) return null;

    const internData = internSnap.data() as Intern;
    const userSettings = await getUserSettings(internData.createdBy);
    
    if (!userSettings) return null;

    return {
      intern: {
        ...internData,
        startDate: firestoreToDateString(internData.startDate),
        endDate: firestoreToDateString(internData.endDate),
        createdAt: internData.createdAt instanceof Timestamp ? internData.createdAt.toDate() : new Date(internData.createdAt)
      },
      userSettings
    };
  } catch (error) {
    console.error('Error getting intern:', error);
    throw error;
  }
}

// Dashboard Stats
export async function getDashboardStats(uid: string) {
  if (!db) {
    console.warn('Firestore not initialized');
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

    let totalVerifications = 0;
    for (const intern of interns) {
      try {
        const verificationSnap = await getDoc(doc(db, "verifications", intern.certificateId));
        if (verificationSnap.exists()) {
          totalVerifications += verificationSnap.data().verificationCount || 0;
        }
      } catch (error) {
        console.warn('Error getting verification count:', error);
      }
    }

    return {
      totalInterns,
      generatedCerts: completedInterns,
      verifications: totalVerifications,
      activeInternships,
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    return {
      totalInterns: 0,
      generatedCerts: 0,
      verifications: 0,
      activeInternships: 0,
    };
  }
}