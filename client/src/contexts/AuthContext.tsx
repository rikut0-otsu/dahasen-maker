import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ApiError, getCurrentUser, logout, startGoogleLogin } from "@/lib/api";
import { flushPendingDiagnosisResults } from "@/lib/diagnosisPersistence";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isOwner: boolean;
  jobTitle?: string | null;
  department?: string | null;
  joinYear?: number | null;
  picture?: string | null;
  latestDiagnosis?: {
    typeId: string;
    createdAt: number;
  } | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isGoogleConfigured: boolean;
  isLoading: boolean;
  signInWithGoogle: (returnTo?: string) => void;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userRef = useRef<AuthUser | null>(null);
  const googleAuthEnabled =
    (import.meta.env.VITE_GOOGLE_AUTH_ENABLED ?? "true") !== "false";

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const refreshUser = async () => {
    try {
      const nextUser = await getCurrentUser();
      setUser(nextUser);
      if (nextUser) {
        void flushPendingDiagnosisResults();
      }
      return nextUser;
    } catch (error) {
      console.error("Failed to refresh user:", error);
      if (error instanceof ApiError && error.status === 401) {
        setUser(null);
        return null;
      }

      return userRef.current;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshUser();
  }, []);

  useEffect(() => {
    const handleWindowFocus = () => {
      void refreshUser();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshUser();
      }
    };

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
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
