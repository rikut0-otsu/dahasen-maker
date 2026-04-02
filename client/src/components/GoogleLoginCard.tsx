import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Chrome, LogOut, PencilLine, Settings2, ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { updateCurrentUserProfile } from "@/lib/api";
import typesData from "@/data/types.json";
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

const JOIN_YEAR_OPTIONS = Array.from({ length: 2026 - 1999 + 1 }, (_, index) => {
  const year = 2026 - index;
  return {
    value: String(year),
    label: `${year}年入社`,
  };
});

export function GoogleLoginCard() {
  const {
    user,
    setUser,
    signOut,
    refreshUser,
    isGoogleConfigured,
    signInWithGoogle,
    isLoading,
  } = useAuth();
  const [, setLocation] = useLocation();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [customJobTitle, setCustomJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [customDepartment, setCustomDepartment] = useState("");
  const [joinYear, setJoinYear] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const latestTypeName = useMemo(() => {
    if (!user?.latestDiagnosis?.typeId) {
      return null;
    }

    return (
      typesData.find((type) => type.id === user.latestDiagnosis?.typeId)?.name ??
      user.latestDiagnosis.typeId
    );
  }, [user?.latestDiagnosis]);

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
    setJoinYear(
      user.joinYear !== null && user.joinYear !== undefined
        ? String(user.joinYear)
        : ""
    );
  }, [user, isProfileDialogOpen]);

  useEffect(() => {
    if (!user || isProfileDialogOpen) {
      return;
    }

    const needsProfileSetup =
      !user.jobTitle?.trim() || !user.department?.trim() || user.joinYear == null;
    if (!needsProfileSetup) {
      return;
    }

    setIsProfileDialogOpen(true);
  }, [user, isProfileDialogOpen]);

  if (user) {
    const resolvedJobTitle = jobTitle === "その他" ? customJobTitle.trim() : jobTitle;
    const resolvedDepartment =
      department === "その他" ? customDepartment.trim() : department;
    const resolvedJoinYear = joinYear ? Number(joinYear) : null;
    const requiresProfileCompletion =
      !user.jobTitle?.trim() || !user.department?.trim() || user.joinYear == null;

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

      if (resolvedJoinYear == null) {
        toast.error("入社年を選択してください");
        return;
      }

      setIsSaving(true);
      try {
        const payload = await updateCurrentUserProfile({
          name: trimmedName,
          jobTitle: trimmedJobTitle,
          department: trimmedDepartment,
          joinYear: resolvedJoinYear,
        });

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
              {(user.joinYear != null || user.jobTitle || user.department) && (
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {[user.joinYear != null ? `${user.joinYear}年入社` : null, user.jobTitle, user.department]
                    .filter(Boolean)
                    .join(" / ")}
                </p>
              )}
              {user.latestDiagnosis && (
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  最新診断: {latestTypeName}
                </p>
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                void refreshUser();
                setIsProfileDialogOpen(true);
              }}
            >
              <PencilLine />
              プロフィール編集
            </DropdownMenuItem>
            {user.isAdmin && (
              <DropdownMenuItem onClick={() => setLocation("/admin")}>
                <ShieldCheck />
                管理者ページ
              </DropdownMenuItem>
            )}
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
            if (!open && requiresProfileCompletion) {
              return;
            }
            setIsProfileDialogOpen(open);
          }}
        >
          <DialogContent
            showCloseButton={!requiresProfileCompletion}
            className="historical-panel grid max-h-[calc(100vh-1.5rem)] max-w-[calc(100%-1.5rem)] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-[2rem] border-border/70 p-0 sm:max-w-xl"
            onEscapeKeyDown={(event) => {
              if (requiresProfileCompletion) {
                event.preventDefault();
              }
            }}
            onInteractOutside={(event) => {
              if (requiresProfileCompletion) {
                event.preventDefault();
              }
            }}
          >
            <DialogHeader className="border-b border-border/70 px-6 py-5 text-left">
              <div className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-primary">
                <Settings2 className="h-4 w-4" />
                アカウント設定
              </div>
              <DialogTitle className="ink-title text-2xl text-foreground">
                {requiresProfileCompletion ? "プロフィール登録" : "プロフィール編集"}
              </DialogTitle>
              <DialogDescription className="text-sm leading-7 text-muted-foreground">
                {requiresProfileCompletion
                  ? "次に進むにはプロフィール登録が必要です。名前、入社年、職種、部署を入力してください。"
                  : "名前、職種、部署を更新できます。部署は候補から選ぶか、自由入力もできます。"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-5 overflow-y-auto overscroll-contain px-6 py-6">
              <div className="rounded-2xl border border-border/70 bg-muted/40 px-4 py-4">
                <p className="text-sm font-semibold text-foreground">最新の診断結果</p>
                {user.latestDiagnosis ? (
                  <div className="mt-2 space-y-2">
                    <p className="text-base font-medium text-foreground">{latestTypeName}</p>
                    <p className="text-xs text-muted-foreground">
                      診断日時:{" "}
                      {new Date(user.latestDiagnosis.createdAt).toLocaleString("ja-JP", {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => {
                        if (requiresProfileCompletion) {
                          return;
                        }
                        setIsProfileDialogOpen(false);
                        setLocation(`/types/${user.latestDiagnosis?.typeId ?? ""}`);
                      }}
                      disabled={requiresProfileCompletion}
                    >
                      診断結果を見る
                    </Button>
                  </div>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    まだ診断結果は保存されていません。
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="profile-join-year">入社年</Label>
                <Select value={joinYear} onValueChange={setJoinYear}>
                  <SelectTrigger id="profile-join-year" className="h-11 w-full">
                    <SelectValue placeholder="入社年を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {JOIN_YEAR_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
              {!requiresProfileCompletion && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsProfileDialogOpen(false)}
                >
                  キャンセル
                </Button>
              )}
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
