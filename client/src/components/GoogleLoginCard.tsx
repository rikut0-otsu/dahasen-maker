import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  loadGoogleIdentityScript,
  parseGoogleCredential,
} from "@/lib/googleIdentity";
import { Button } from "@/components/ui/button";

export function GoogleLoginCard() {
  const { user, signIn, signOut, googleClientId, isGoogleConfigured } =
    useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user || !isGoogleConfigured || !buttonRef.current) {
      return;
    }

    let isMounted = true;

    loadGoogleIdentityScript()
      .then(() => {
        if (!isMounted || !buttonRef.current || !window.google?.accounts?.id) {
          return;
        }

        buttonRef.current.innerHTML = "";
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: response => {
            try {
              const nextUser = parseGoogleCredential(response.credential);
              signIn(nextUser);
              toast.success(`Googleでログインしました: ${nextUser.name}`);
            } catch (error) {
              console.error(error);
              toast.error("Googleログインに失敗しました");
            }
          },
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "pill",
          width: 260,
        });
      })
      .catch(error => {
        console.error(error);
        toast.error("Googleログイン用スクリプトを読み込めませんでした");
      });

    return () => {
      isMounted = false;
    };
  }, [googleClientId, isGoogleConfigured, signIn, user]);

  if (user) {
    return (
      <div className="flex items-center gap-3 rounded-full border border-border/80 bg-background/90 px-3 py-2 shadow-sm">
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name}
            className="size-9 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {user.name.slice(0, 1)}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {user.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          className="rounded-full"
          onClick={() => {
            window.google?.accounts?.id?.disableAutoSelect?.();
            signOut();
            toast.success("ログアウトしました");
          }}
          aria-label="ログアウト"
        >
          <LogOut />
        </Button>
      </div>
    );
  }

  if (!isGoogleConfigured) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-background/75 px-4 py-3 text-left shadow-sm">
        <p className="text-sm font-semibold text-foreground">
          Googleログインは未設定です
        </p>
        <p className="mt-1 text-xs leading-6 text-muted-foreground">
          `VITE_GOOGLE_CLIENT_ID` を設定すると有効になります。
        </p>
      </div>
    );
  }

  return <div ref={buttonRef} className="min-h-11" />;
}
