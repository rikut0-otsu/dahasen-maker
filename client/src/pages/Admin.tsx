import { useEffect, useState } from "react";
import { ShieldCheck, Users, Mail, Briefcase, Building2, KeyRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { getAdminUsers, type AdminUser } from "@/lib/api";

export default function Admin() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      try {
        const payload = await getAdminUsers();
        if (!isMounted) {
          return;
        }

        setUsers(payload.users);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "ユーザー一覧の取得に失敗しました");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background paper-texture">
      <section className="container py-10 md:py-16">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="historical-panel rounded-[2rem] p-6 md:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-4 py-2 text-sm font-semibold text-primary">
              <ShieldCheck className="h-4 w-4" />
              管理者ページ
            </div>
            <h1 className="ink-title mt-4 text-3xl font-bold text-foreground">
              管理者のみがアクセスできます
            </h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
              この画面は `isAdmin` が有効なアカウントだけに表示されます。Cloudflare の
              `ADMIN_GOOGLE_SUBS` または `ADMIN_EMAILS` に一致したアカウントが管理者になります。
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="historical-panel rounded-[2rem] p-6">
              <div className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                <Users className="h-4 w-4" />
                現在のログイン情報
              </div>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">名前</dt>
                  <dd className="font-medium text-foreground">{user?.name ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">メールアドレス</dt>
                  <dd className="font-medium text-foreground">{user?.email ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">管理者権限</dt>
                  <dd className="font-medium text-foreground">
                    {user?.isAdmin ? "有効" : "無効"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="historical-panel rounded-[2rem] p-6">
              <h2 className="ink-title text-xl font-bold text-foreground">次に載せやすい機能</h2>
              <ul className="mt-4 space-y-2 text-sm leading-7 text-muted-foreground">
                <li>ユーザー一覧と管理者付与</li>
                <li>診断結果の集計ダッシュボード</li>
                <li>社内向けお知らせや運用メモ</li>
              </ul>
              <Button className="mt-5" asChild>
                <a href="/">トップへ戻る</a>
              </Button>
            </div>
          </div>

          <div className="historical-panel rounded-[2rem] p-6 md:p-8">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  <Users className="h-4 w-4" />
                  登録ユーザー一覧
                </div>
                <h2 className="ink-title mt-2 text-2xl font-bold text-foreground">
                  現在の登録アカウント
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                合計 {users.length} 件
              </p>
            </div>

            {isLoading && (
              <div className="mt-6 rounded-2xl border border-border/70 bg-background/70 px-4 py-6 text-sm text-muted-foreground">
                ユーザー一覧を読み込み中です...
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-6 text-sm text-destructive">
                {error}
              </div>
            )}

            {!isLoading && !error && (
              <div className="mt-6 grid gap-4">
                {users.map((listedUser) => (
                  <article
                    key={listedUser.id}
                    className="rounded-[1.5rem] border border-border/70 bg-white/85 p-5 dark:bg-[rgba(8,14,24,0.58)]"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              {listedUser.name}
                            </h3>
                            {listedUser.isAdmin && (
                              <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                Admin
                              </span>
                            )}
                          </div>
                          {listedUser.rawName !== listedUser.name && (
                            <p className="text-xs text-muted-foreground">
                              Google名義: {listedUser.rawName}
                            </p>
                          )}
                        </div>

                        <div className="grid gap-2 text-sm text-muted-foreground">
                          <p className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {listedUser.email}
                          </p>
                          <p className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            {listedUser.jobTitle || "職種未設定"}
                          </p>
                          <p className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            {listedUser.department || "部署未設定"}
                          </p>
                          <p className="flex items-center gap-2 break-all">
                            <KeyRound className="h-4 w-4" />
                            OpenID(Sub): {listedUser.googleSub}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs leading-6 text-muted-foreground md:text-right">
                        <p>登録日: {new Date(listedUser.createdAt).toLocaleString("ja-JP")}</p>
                        <p>更新日: {new Date(listedUser.updatedAt).toLocaleString("ja-JP")}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
