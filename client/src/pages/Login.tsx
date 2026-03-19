import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles } from "@/components/Sparkles";
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
    <div className="min-h-screen overflow-hidden bg-background paper-texture px-4 py-10 md:px-6 md:py-14">
      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        <div className="absolute inset-0 opacity-80">
          <div className="absolute left-[-5rem] top-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl md:left-[-2rem] md:top-20 md:h-96 md:w-96" />
          <div className="absolute right-[-5rem] top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl md:right-[-1rem] md:top-16 md:h-[28rem] md:w-[28rem]" />
          <div className="absolute inset-x-[12%] bottom-[-5rem] h-40 rounded-full bg-primary/10 blur-3xl md:inset-x-[26%] md:h-56" />
          <div className="absolute inset-0 bg-[url('/daha-sengen-main-visual.png')] bg-cover bg-center opacity-10" />
        </div>

        <div className="pointer-events-none absolute inset-x-[8%] bottom-0 top-[24%] opacity-95 md:inset-x-[18%] md:top-[18%]">
          <Sparkles
            count={16}
            minSize={6}
            maxSize={16}
            topOffset={-14}
            direction="down"
            minDuration={3.2}
            maxDuration={5.2}
          />
        </div>

        <div className="relative z-10 grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <div className="mx-auto flex max-w-[38rem] flex-col items-center gap-5 text-center lg:items-start lg:text-left">
            <div className="seal-tag inline-flex rounded-full px-4 py-2 text-sm font-semibold text-primary">
              CYBERAGENT PURPOSE
            </div>
            <h1 className="ink-title text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
              閉塞感を打破する宣言を
              <br />
              ここから刻もう
            </h1>
            <p className="max-w-[32rem] text-sm leading-7 text-muted-foreground md:text-base">
              Googleログインすると、診断結果を保存していつでも見返せるようになります。
              <br />
              自分だけの「打破宣言」をつくりましょう。
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-x-8 bottom-8 top-6 rounded-full bg-[radial-gradient(circle,_rgba(255,176,64,0.28),_rgba(255,176,64,0.0)_72%)] blur-2xl" />
            <div className="historical-panel rounded-[2.2rem] border border-border p-5 shadow-[0_18px_50px_rgba(28,43,31,0.08)] md:p-8 bg-[url('/daha-sengen-main-visual.png')] bg-cover bg-center bg-blend-soft-light">
              <div className="wash-paper rounded-[1.8rem] border border-border/70 p-6 md:p-7">
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

        <div className="absolute bottom-0 left-1/2 z-10 w-full -translate-x-1/2 text-center text-xs text-muted-foreground">
          <span className="font-semibold">※</span> ログイン後は、元のページへ遷移します。
        </div>
      </div>
    </div>
  );
}
