import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserSettings } from "@/lib/firestore";
import type { UserSettings } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  userSettings: UserSettings | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserSettings: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserSettings = async () => {
    if (user) {
      const settings = await getUserSettings(user.uid);
      setUserSettings(settings);
    }
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await refreshUserSettings();
      } else {
        setUserSettings(null);
      }
      setLoading(false);
    });

    // Handle redirect result from Google sign-in
    getRedirectResult(auth).catch((error) => {
      console.error("Redirect result error:", error);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase not configured');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    if (!auth) throw new Error('Firebase not configured');
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  const signOut = async () => {
    if (!auth) throw new Error('Firebase not configured');
    await firebaseSignOut(auth);
  };

  const value = {
    user,
    userSettings,
    loading,
    signIn,
    signInWithGoogle,
    signOut,
    refreshUserSettings,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
