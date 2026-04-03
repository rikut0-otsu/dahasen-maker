import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles } from "@/components/Sparkles";
import { useAuth } from "@/contexts/AuthContext";
import { CircleHelp } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { user, isLoading, signInWithGoogle } = useAuth();
  const params = new URLSearchParams(window.location.search);
  const loginStatus = params.get("login");
  const returnTo = params.get("returnTo") || "/";

  useEffect(() => {
    if (!isLoading && user) {
      setLocation(returnTo, { replace: true });
    }
  }, [isLoading, returnTo, user, setLocation]);

  const handleSignIn = () => {
    signInWithGoogle(returnTo);
  };

  const loginMessage =
    loginStatus === "unauthorized"
      ? "このアドレスはCAアカウントではないため、権限がありません。@cyberagent.co.jp のアドレスでログインしてください。"
      : loginStatus === "expired"
        ? "ログインの有効期限が切れました。もう一度お試しください。"
        : loginStatus === "error"
          ? "ログインに失敗しました。時間をおいて再度お試しください。"
          : null;

  return (
    <div className="min-h-screen overflow-hidden bg-background paper-texture">
      <div className="relative isolate min-h-screen px-4 py-6 md:px-6 md:py-10">
        <div className="absolute inset-0 opacity-90">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-[84vh] w-full max-w-5xl bg-[url('/daha-sengen-main-visual.png?v=20260330')] bg-contain bg-center bg-no-repeat opacity-[0.38] md:h-[104vh] md:max-w-[88rem] md:opacity-[0.5]" />
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

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-4xl items-center justify-center md:min-h-[calc(100vh-4rem)]">
          <div className="flex w-full flex-col items-center gap-6 text-center md:gap-10">
            <div className="flex max-w-[42rem] flex-col items-center gap-5">
              <div className="seal-tag inline-flex rounded-full px-4 py-2 text-sm font-semibold text-primary">
                DAHASEN MAKER
              </div>
              <h1 className="ink-title text-[2.05rem] font-bold leading-[1.18] text-foreground [text-wrap:initial] [word-break:keep-all] md:text-[2.9rem] lg:text-[3.7rem]">
                <span className="whitespace-nowrap">あなたの「打破宣言」を</span>
                <br />
                ここから刻もう
              </h1>
              <p className="max-w-[34rem] text-sm leading-8 text-muted-foreground md:text-base">
                いざ診断結果をもとに
                <br />
                自分だけの「打破宣言」をつくりましょう。
              </p>
            </div>

            <div className="relative w-full max-w-[32rem]">
              <div className="absolute inset-x-10 bottom-8 top-6 rounded-full bg-[radial-gradient(circle,_rgba(255,176,64,0.24),_rgba(255,176,64,0.0)_72%)] blur-2xl" />
              <div className="historical-panel rounded-[2.2rem] border border-border p-5 shadow-[0_18px_50px_rgba(28,43,31,0.08)] md:p-7">
                <div className="wash-paper rounded-[1.8rem] border border-border/70 p-6 md:p-7">
                  <p className="text-sm leading-7 text-muted-foreground">
                    あなたの「打破宣言」がはじまります。
                    <br />
                    歴史に名を残した偉人達から、
                    <br />
                    自分の強みを見つけてみましょう。
                  </p>
                  <div className="mt-5 rounded-[1.35rem] border border-border/70 bg-[rgba(255,252,244,0.82)] px-5 py-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:bg-[rgba(18,28,43,0.72)]">
                    <p className="text-sm font-semibold leading-7 text-foreground [text-wrap:pretty]">
                      ※サイバーエージェントのアカウントのみログインできます
                    </p>
                    <p className="mt-1.5 text-xs leading-6 text-muted-foreground [text-wrap:pretty]">
                      `@cyberagent.co.jp` のGoogleアカウントをご利用ください。
                    </p>
                  </div>
                  {loginMessage && (
                    <div className="mt-4 rounded-[1.35rem] border border-destructive/20 bg-destructive/8 px-4 py-3 text-left">
                      <p className="text-sm font-semibold text-foreground">ログインできませんでした</p>
                      <p className="mt-1 text-xs leading-6 text-muted-foreground">
                        {loginMessage}
                      </p>
                    </div>
                  )}

                  <div className="mt-8 flex flex-col gap-3">
                    <Button onClick={handleSignIn} className="h-12 w-full font-semibold">
                      Google でログイン
                    </Button>
                    <div className="pt-1 text-center text-xs text-muted-foreground">
                      <p>
                        <span className="font-semibold">※</span> ログイン後は、元のページへ遷移します。
                      </p>
                      <p className="mt-2 tracking-[0.08em] text-muted-foreground/90">
                        <span className="font-medium text-foreground/80">Developed by</span>{" "}
                        <span className="font-semibold text-foreground">Rikuto Otsu</span>
                      </p>
                      <div className="mt-3 rounded-[1.35rem] border border-border/70 bg-[rgba(18,28,43,0.08)] p-4 text-left dark:bg-[rgba(18,28,43,0.72)]">
                        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                          <CircleHelp className="h-3.5 w-3.5" />
                          ログインできない場合
                        </div>
                        <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
                          問い合わせ先は管理者にご確認ください。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
