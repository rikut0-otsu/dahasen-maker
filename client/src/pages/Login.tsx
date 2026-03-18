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
    <div className="min-h-screen bg-background paper-texture px-4 py-12">
      <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center justify-center gap-10">
        <div className="absolute inset-0 opacity-70">
          <div className="absolute left-[-6rem] top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-[-5rem] top-32 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute inset-0 bg-[url('/daha-sengen-main-visual.png')] bg-cover bg-center opacity-10" />
        </div>

        <div className="relative w-full">
          <div className="mx-auto flex max-w-[32rem] flex-col items-center gap-4 text-center">
            <div className="seal-tag inline-flex rounded-full px-4 py-2 text-sm font-semibold text-primary">
              CYBERAGENT PURPOSE
            </div>
            <h1 className="ink-title text-4xl font-bold text-foreground md:text-5xl">
              閉塞感を打破する宣言を
              <br />
              ここから刻もう
            </h1>
            <p className="max-w-[28rem] text-sm leading-7 text-muted-foreground">
              Googleログインすると、診断結果を保存していつでも見返せるようになります。
              <br />
              自分だけの「打破宣言」をつくりましょう。
            </p>
          </div>

          <div className="mt-10">
            <div className="historical-panel rounded-[2.2rem] border border-border p-8 shadow-[0_18px_50px_rgba(28,43,31,0.08)] bg-[url('/daha-sengen-main-visual.png')] bg-cover bg-center bg-blend-soft-light">
              <div className="wash-paper rounded-[1.8rem] border border-border/70 p-6">
                <p className="text-sm leading-7 text-muted-foreground">
                  ここからあなたの「打破宣言」がはじまります。
                  <br />
                  戦国時代の風景を思い浮かべながら、
                  自分の強みを見つけてみましょう。
                </p>

                <div className="mt-8 flex flex-col gap-3">
                  <Button
                    onClick={handleSignIn}
                    className="h-12 w-full font-semibold"
                  >
                    Google でログイン
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <span className="font-semibold">※</span> ログイン後は、元のページへ遷移します。
        </div>
      </div>
    </div>
  );
}
