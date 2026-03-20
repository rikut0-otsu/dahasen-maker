import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles } from "@/components/Sparkles";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [, setLocation] = useLocation();
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
    <div className="min-h-screen overflow-hidden bg-background paper-texture">
      <div className="relative isolate min-h-screen px-4 py-8 md:px-6 md:py-10">
        <div className="absolute inset-0 opacity-90">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-[84vh] w-full max-w-5xl bg-[url('/daha-sengen-main-visual.png')] bg-contain bg-center bg-no-repeat opacity-[0.38] md:h-[88vh] md:opacity-[0.5]" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,252,244,0.68),rgba(255,250,240,0.58))] dark:bg-[linear-gradient(180deg,rgba(10,18,32,0.58),rgba(10,18,32,0.7))]" />
          <div className="absolute left-[6%] top-[14%] h-72 w-72 rounded-full bg-primary/10 blur-3xl md:h-96 md:w-96" />
          <div className="absolute right-[8%] top-[20%] h-72 w-72 rounded-full bg-accent/10 blur-3xl md:h-[30rem] md:w-[30rem]" />
          <div className="absolute inset-x-[18%] bottom-[-4rem] h-44 rounded-full bg-primary/10 blur-3xl md:h-56" />
        </div>

        <div className="pointer-events-none absolute inset-x-[12%] bottom-0 top-[20%] opacity-95 md:inset-x-[22%] md:top-[18%]">
          <Sparkles
            count={12}
            minSize={4}
            maxSize={10}
            topOffset={-14}
            direction="down"
            minDuration={3.4}
            maxDuration={5.4}
          />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl items-center justify-center">
          <div className="flex w-full flex-col items-center gap-8 text-center md:gap-10">
            <div className="flex max-w-[42rem] flex-col items-center gap-5">
              <div className="seal-tag inline-flex rounded-full px-4 py-2 text-sm font-semibold text-primary">
                CYBERAGENT PURPOSE
              </div>
              <h1 className="ink-title text-4xl font-bold leading-[1.18] text-foreground md:text-5xl lg:text-6xl">
                閉塞感を打破する宣言を
                <br />
                ここから刻もう
              </h1>
              <p className="max-w-[34rem] text-sm leading-8 text-muted-foreground md:text-base">
                Googleログインすると、診断結果を保存していつでも見返せるようになります。
                <br />
                自分だけの「打破宣言」をつくりましょう。
              </p>
            </div>

            <div className="relative w-full max-w-[32rem]">
              <div className="absolute inset-x-10 bottom-8 top-6 rounded-full bg-[radial-gradient(circle,_rgba(255,176,64,0.24),_rgba(255,176,64,0.0)_72%)] blur-2xl" />
              <div className="historical-panel rounded-[2.2rem] border border-border p-5 shadow-[0_18px_50px_rgba(28,43,31,0.08)] md:p-7">
                <div className="wash-paper rounded-[1.8rem] border border-border/70 p-6 md:p-7">
                  <p className="text-sm leading-7 text-muted-foreground">
                    ここからあなたの「打破宣言」がはじまります。
                    <br />
                    戦国時代の風景を思い浮かべながら、
                    自分の強みを見つけてみましょう。
                  </p>

                  <div className="mt-8 flex flex-col gap-3">
                    <Button onClick={handleSignIn} className="h-12 w-full font-semibold">
                      Google でログイン
                    </Button>
                    <p className="text-xs tracking-[0.08em] text-muted-foreground/90">
                      <span className="font-medium text-foreground/80">Developed by</span>{" "}
                      <span className="font-semibold text-foreground">Rikuto Otsu</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-6 text-center text-xs text-muted-foreground">
          <span className="font-semibold">※</span> ログイン後は、元のページへ遷移します。
        </div>
      </div>
    </div>
  );
}
