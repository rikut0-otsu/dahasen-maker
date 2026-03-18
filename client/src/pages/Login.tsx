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
      <div className="w-full max-w-lg rounded-[2.5rem] border border-border bg-card p-8 shadow-[0_20px_60px_rgba(31,42,35,0.12)]">
        <div className="mb-6 flex flex-col items-center gap-4 text-center">
          <div className="seal-tag inline-flex rounded-full px-4 py-2 text-sm font-semibold text-primary">
            CYBERAGENT PURPOSE
          </div>
          <h1 className="ink-title text-3xl font-bold text-foreground">ログインしてはじめよう</h1>
          <p className="max-w-[26rem] text-sm leading-7 text-muted-foreground">
            このサイトでは、あなたの「打破タイプ」を診断し、
            あなたにぴったりの活躍宣言を提案します。
            <br />
            Google アカウントでログインすると、結果の保存と再閲覧が可能になります。
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleSignIn}
            className="h-12 w-full font-semibold"
          >
            Google でログイン
          </Button>
          <div className="text-center text-xs text-muted-foreground">
            ※ログインせずに閲覧する場合は、トップページへ戻ってください。
          </div>
        </div>
      </div>
    </div>
  );
}
