import { toast } from "sonner";
import { Chrome, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export function GoogleLoginCard() {
  const {
    user,
    signOut,
    isGoogleConfigured,
    signInWithGoogle,
    isLoading,
  } = useAuth();

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
          `VITE_GOOGLE_AUTH_ENABLED=true` とサーバー側の Google OAuth 設定で有効になります。
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

  return (
    <Button
      type="button"
      variant="outline"
      className="h-11 rounded-full border-border/80 bg-background/90 px-5 shadow-sm"
      onClick={() => signInWithGoogle(window.location.pathname + window.location.search)}
    >
      <Chrome className="size-4" />
      Googleでログイン
    </Button>
  );
}
