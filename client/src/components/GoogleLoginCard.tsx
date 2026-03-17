import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { loadGoogleIdentityScript } from "@/lib/googleIdentity";
import { Button } from "@/components/ui/button";

type GoogleIdentityWindow = Window & {
  google?: {
    accounts?: {
      id?: {
        initialize: (options: {
          client_id: string;
          callback: (response: { credential: string }) => void;
          cancel_on_tap_outside?: boolean;
        }) => void;
        renderButton: (
          parent: HTMLElement,
          options: {
            theme?: "outline" | "filled_blue" | "filled_black";
            size?: "large" | "medium" | "small";
            text?:
              | "signin_with"
              | "signup_with"
              | "continue_with"
              | "signin";
            shape?: "rectangular" | "pill" | "circle" | "square";
            width?: string | number;
          }
        ) => void;
        disableAutoSelect: () => void;
      };
    };
  };
};

export function GoogleLoginCard() {
  const {
    user,
    signOut,
    googleClientId,
    isGoogleConfigured,
    signInWithGoogleCredential,
    isLoading,
  } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);
  const identityWindow = window as GoogleIdentityWindow;

  useEffect(() => {
    if (user || !isGoogleConfigured || !buttonRef.current || isLoading) {
      return;
    }

    let isMounted = true;

    loadGoogleIdentityScript()
      .then(() => {
        const googleIdentity = identityWindow.google?.accounts?.id;
        if (!isMounted || !buttonRef.current || !googleIdentity) {
          return;
        }

        buttonRef.current.innerHTML = "";
        googleIdentity.initialize({
          client_id: googleClientId,
          callback: async response => {
            try {
              const nextUser = await signInWithGoogleCredential(
                response.credential
              );
              toast.success(`Googleでログインしました: ${nextUser.name}`);
            } catch (error) {
              console.error(error);
              toast.error("Googleログインに失敗しました");
            }
          },
          cancel_on_tap_outside: true,
        });

        googleIdentity.renderButton(buttonRef.current, {
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
  }, [
    googleClientId,
    isGoogleConfigured,
    isLoading,
    signInWithGoogleCredential,
    user,
  ]);

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
            identityWindow.google?.accounts?.id?.disableAutoSelect?.();
            void signOut().then(() => {
              toast.success("ログアウトしました");
            });
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

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-background/75 px-4 py-3 text-sm text-muted-foreground shadow-sm">
        ログイン状態を確認しています...
      </div>
    );
  }

  return <div ref={buttonRef} className="min-h-11" />;
}
