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

// User Settings
export async function saveUserSettings(settings: InsertUserSettings): Promise<void> {
  const userRef = doc(db, "userSettings", settings.uid);
  await setDoc(userRef, {
    ...settings,
    setupCompleted: true,
    createdAt: new Date(),
  });
}

export async function getUserSettings(uid: string): Promise<UserSettings | null> {
  const userRef = doc(db, "userSettings", uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as UserSettings;
  }
  return null;
}

// File Upload
export async function uploadFile(file: File, path: string): Promise<string> {
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

// Interns
export async function addIntern(internData: InsertIntern): Promise<string> {
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
}

export async function getInternsByUser(uid: string): Promise<Intern[]> {
  const q = query(
    collection(db, "interns"),
    where("createdBy", "==", uid),
    orderBy("createdAt", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as Intern);
}

export async function getInternByCertificateId(certificateId: string): Promise<{ intern: Intern; userSettings: UserSettings } | null> {
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
}

// Dashboard Stats
export async function getDashboardStats(uid: string) {
  const interns = await getInternsByUser(uid);
  
  const totalInterns = interns.length;
  const completedInterns = interns.filter(intern => intern.status === "completed").length;
  const activeInternships = interns.filter(intern => intern.status === "active").length;

  // Get total verifications (simplified - in real app you'd aggregate from all certificates)
  let totalVerifications = 0;
  for (const intern of interns) {
    const verificationRef = doc(db, "verifications", intern.certificateId);
    const verificationSnap = await getDoc(verificationRef);
    if (verificationSnap.exists()) {
      totalVerifications += verificationSnap.data().verificationCount || 0;
    }
  }

  return {
    totalInterns,
    generatedCerts: completedInterns,
    verifications: totalVerifications,
    activeInternships,
  };
}
