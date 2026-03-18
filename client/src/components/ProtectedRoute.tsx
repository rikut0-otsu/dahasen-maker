import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      const returnTo = location || "/";
      setLocation(`/login?returnTo=${encodeURIComponent(returnTo)}`);
    }
  }, [isLoading, user, location, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="animate-pulse rounded-2xl border border-border bg-card px-10 py-8 text-center">
          <p className="text-lg font-semibold">読み込み中…</p>
          <p className="mt-2 text-sm text-muted-foreground">少々お待ちください。</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
