import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [location, setLocation] = useLocation();
  const { user, isLoading, signInWithGoogle } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      const params = new URLSearchParams(window.location.search);
      const returnTo = params.get("returnTo") || "/";
      setLocation(returnTo, { replace: true });
    }
  }, [isLoading, user, setLocation]);

  const handleSignIn = () => {
    const params = new URLSearchParams(window.location.search);
    const returnTo = params.get("returnTo") || "/";
    signInWithGoogle(returnTo);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-10 shadow-[0_18px_50px_rgba(28,43,31,0.08)]">
        <h1 className="text-2xl font-bold text-foreground">ログインしてください</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          このサイトを利用するにはログインが必要です。下のボタンから Google でログインしてください。
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Button onClick={handleSignIn} className="h-12">
            Google でログイン
          </Button>
        </div>
      </div>
    </div>
  );
}
