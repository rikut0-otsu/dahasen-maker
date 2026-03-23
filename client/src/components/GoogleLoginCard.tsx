import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Chrome, LogOut, PencilLine, Settings2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { updateCurrentUserProfile } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const JOB_TITLE_OPTIONS = [
  "選択してください",
  "ビジネス",
  "エンジニア",
  "クリエイター",
  "その他",
] as const;

const DEPARTMENT_OPTIONS = [
  "選択してください",
  "内定者",
  "全社",
  "インターネット広告事業本部（新規含む）",
  "CyberACE",
  "CyberZ",
  "AI事業本部",
  "ABEMA管轄",
  "宣伝本部",
  "WINTICKET",
  "アニメ＆IP事業本部",
  "ライフスタイル管轄",
  "FANTECH本部",
  "IU",
  "SGE",
  "採用人事",
  "その他",
] as const;

const PROFILE_PROMPT_DISMISSED_KEY = "profile-prompt-dismissed";

export function GoogleLoginCard() {
  const {
    user,
    setUser,
    signOut,
    isGoogleConfigured,
    signInWithGoogle,
    isLoading,
  } = useAuth();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [customJobTitle, setCustomJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [customDepartment, setCustomDepartment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoPromptActive, setIsAutoPromptActive] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    const nextJobTitle = user.jobTitle ?? "";
    const nextDepartment = user.department ?? "";
    const isPresetJobTitle = JOB_TITLE_OPTIONS.includes(
      nextJobTitle as (typeof JOB_TITLE_OPTIONS)[number]
    );
    const isPresetDepartment = DEPARTMENT_OPTIONS.includes(
      nextDepartment as (typeof DEPARTMENT_OPTIONS)[number]
    );

    setName(user.name ?? "");
    setJobTitle(
      nextJobTitle ? (isPresetJobTitle ? nextJobTitle : "その他") : "選択してください"
    );
    setCustomJobTitle(isPresetJobTitle ? "" : nextJobTitle);
    setDepartment(
      nextDepartment ? (isPresetDepartment ? nextDepartment : "その他") : "選択してください"
    );
    setCustomDepartment(isPresetDepartment ? "" : nextDepartment);
  }, [user, isProfileDialogOpen]);

  useEffect(() => {
    if (!user || isProfileDialogOpen) {
      return;
    }

    const needsProfileSetup = !user.jobTitle?.trim() || !user.department?.trim();
    if (!needsProfileSetup) {
      localStorage.removeItem(`${PROFILE_PROMPT_DISMISSED_KEY}:${user.id}`);
      return;
    }

    if (localStorage.getItem(`${PROFILE_PROMPT_DISMISSED_KEY}:${user.id}`) === "true") {
      return;
    }

    setIsAutoPromptActive(true);
    setIsProfileDialogOpen(true);
  }, [user, isProfileDialogOpen]);

  if (user) {
    const resolvedJobTitle = jobTitle === "その他" ? customJobTitle.trim() : jobTitle;
    const resolvedDepartment =
      department === "その他" ? customDepartment.trim() : department;

    const handleSaveProfile = async () => {
      const trimmedName = name.trim();
      const trimmedJobTitle =
        resolvedJobTitle === "選択してください" ? "" : resolvedJobTitle.trim();
      const trimmedDepartment =
        resolvedDepartment === "選択してください" ? "" : resolvedDepartment.trim();

      if (!trimmedName) {
        toast.error("名前を入力してください");
        return;
      }

      if (jobTitle === "その他" && !trimmedJobTitle) {
        toast.error("職種を入力してください");
        return;
      }

      if (department === "その他" && !trimmedDepartment) {
        toast.error("部署名を入力してください");
        return;
      }

      setIsSaving(true);
      try {
        const payload = await updateCurrentUserProfile({
          name: trimmedName,
          jobTitle: trimmedJobTitle,
          department: trimmedDepartment,
        });

        localStorage.removeItem(`${PROFILE_PROMPT_DISMISSED_KEY}:${user.id}`);
        setIsAutoPromptActive(false);
        setUser(payload.user);
        setIsProfileDialogOpen(false);
        toast.success("プロフィールを更新しました");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "プロフィールの更新に失敗しました";
        toast.error(message);
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-10 w-auto max-w-full rounded-full border-border/80 bg-background/90 px-3 shadow-sm md:h-11"
            >
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="size-8 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {user.name.slice(0, 1)}
                </div>
              )}
              <span className="font-medium text-foreground">アカウント設定</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2">
            <div className="px-2 py-2">
              <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              {(user.jobTitle || user.department) && (
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {[user.jobTitle, user.department].filter(Boolean).join(" / ")}
                </p>
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsProfileDialogOpen(true)}>
              <PencilLine />
              プロフィール編集
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                void signOut().then(() => {
                  toast.success("ログアウトしました");
                });
              }}
            >
              <LogOut />
              ログアウト
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog
          open={isProfileDialogOpen}
          onOpenChange={(open) => {
            if (!open && isAutoPromptActive) {
              localStorage.setItem(`${PROFILE_PROMPT_DISMISSED_KEY}:${user.id}`, "true");
              setIsAutoPromptActive(false);
            }
            setIsProfileDialogOpen(open);
          }}
        >
          <DialogContent className="historical-panel max-w-[calc(100%-1.5rem)] rounded-[2rem] border-border/70 p-0 sm:max-w-xl">
            <DialogHeader className="border-b border-border/70 px-6 py-5 text-left">
              <div className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-primary">
                <Settings2 className="h-4 w-4" />
                アカウント設定
              </div>
              <DialogTitle className="ink-title text-2xl text-foreground">
                プロフィール編集
              </DialogTitle>
              <DialogDescription className="text-sm leading-7 text-muted-foreground">
                名前、職種、部署を更新できます。部署は候補から選ぶか、自由入力もできます。
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-5 px-6 py-6">
              <div className="grid gap-2">
                <Label htmlFor="profile-name">名前</Label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="例: 山田 太郎"
                  maxLength={50}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="profile-job-title">職種</Label>
                <Select value={jobTitle} onValueChange={setJobTitle}>
                  <SelectTrigger id="profile-job-title" className="h-11 w-full">
                    <SelectValue placeholder="職種を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TITLE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {jobTitle === "その他" && (
                  <Input
                    value={customJobTitle}
                    onChange={(event) => setCustomJobTitle(event.target.value)}
                    placeholder="職種を入力"
                    maxLength={50}
                  />
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="profile-department">部署</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger id="profile-department" className="h-11 w-full">
                    <SelectValue placeholder="部署を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENT_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {department === "その他" && (
                  <Input
                    value={customDepartment}
                    onChange={(event) => setCustomDepartment(event.target.value)}
                    placeholder="部署名を入力"
                    maxLength={50}
                  />
                )}
              </div>
            </div>

            <DialogFooter className="border-t border-border/70 px-6 py-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsProfileDialogOpen(false)}
              >
                キャンセル
              </Button>
              <Button type="button" onClick={() => void handleSaveProfile()} disabled={isSaving}>
                {isSaving ? "保存中..." : "保存する"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
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
      className="h-10 w-auto rounded-full border-border/80 bg-background/90 px-4 shadow-sm md:h-11 md:px-5"
      onClick={() => signInWithGoogle(window.location.pathname + window.location.search)}
    >
      <Chrome className="size-4" />
      Googleでログイン
    </Button>
  );
}
