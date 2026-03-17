import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getCurrentUser, logout, loginWithGoogleCredential } from "@/lib/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  picture?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  googleClientId: string;
  isGoogleConfigured: boolean;
  isLoading: boolean;
  signInWithGoogleCredential: (credential: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

  const refreshUser = async () => {
    try {
      const nextUser = await getCurrentUser();
      setUser(nextUser);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshUser();
  }, []);

  const value: AuthContextValue = {
    user,
    googleClientId,
    isGoogleConfigured: googleClientId.length > 0,
    isLoading,
    signInWithGoogleCredential: async credential => {
      const nextUser = await loginWithGoogleCredential(credential);
      setUser(nextUser);
      return nextUser;
    },
    signOut: async () => {
      await logout();
      setUser(null);
    },
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
