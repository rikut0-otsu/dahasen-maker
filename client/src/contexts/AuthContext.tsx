import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getCurrentUser, logout, startGoogleLogin } from "@/lib/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  jobTitle?: string | null;
  department?: string | null;
  picture?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isGoogleConfigured: boolean;
  isLoading: boolean;
  signInWithGoogle: (returnTo?: string) => void;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const googleAuthEnabled =
    (import.meta.env.VITE_GOOGLE_AUTH_ENABLED ?? "true") !== "false";

  const refreshUser = async () => {
    try {
      const nextUser = await getCurrentUser();
      setUser(nextUser);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      // エラーが出た場合は null で処理を続行
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshUser();
  }, []);

  const value: AuthContextValue = {
    user,
    isGoogleConfigured: googleAuthEnabled,
    isLoading,
    signInWithGoogle: returnTo => {
      startGoogleLogin(returnTo);
    },
    signOut: async () => {
      await logout();
      setUser(null);
    },
    refreshUser,
    setUser,
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
