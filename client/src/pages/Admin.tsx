import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  BadgeCheck,
  BarChart3,
  Briefcase,
  Building2,
  Crown,
  LayoutDashboard,
  Mail,
  RefreshCcw,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Bar, BarChart, ResponsiveContainer } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAdminDashboard,
  getAdminUsers,
  updateAdminUser,
  type AdminDashboardDepartment,
  type AdminDashboardTrend,
  type AdminDashboardType,
  type AdminUser,
} from "@/lib/api";
import typesData from "@/data/types.json";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const typeNameById = Object.fromEntries(
  typesData.map((type) => [type.id, type.name])
) as Record<string, string>;

function formatDay(date: string) {
  return new Date(date).toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
  });
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-white/10 bg-[rgba(10,16,28,0.86)] text-slate-50 shadow-[0_20px_70px_rgba(2,6,23,0.35)]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-4">
          <CardDescription className="font-mono text-[11px] uppercase tracking-[0.22em] text-slate-400">
            {title}
          </CardDescription>
          <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-2">
            <Icon className="h-4 w-4 text-emerald-300" />
          </div>
        </div>
        <CardTitle className="font-mono text-3xl font-semibold tracking-tight text-white">
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm leading-6 text-slate-400">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function Admin() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [trends, setTrends] = useState<AdminDashboardTrend[]>([]);
  const [topTypes, setTopTypes] = useState<AdminDashboardType[]>([]);
  const [topDepartments, setTopDepartments] = useState<AdminDashboardDepartment[]>([]);
  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalDiagnoses: 0,
    activeUsers: 0,
    adminCount: 0,
    avgDiagnosesPerUser: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  const loadAdminData = async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    }

    try {
      const [usersPayload, dashboardPayload] = await Promise.all([
        getAdminUsers(),
        getAdminDashboard(),
      ]);

      setUsers(usersPayload.users);
      setSummary(dashboardPayload.summary);
      setTrends(dashboardPayload.trends);
      setTopTypes(dashboardPayload.topTypes);
      setTopDepartments(dashboardPayload.topDepartments);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "管理データの取得に失敗しました");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void loadAdminData();
  }, []);

  const handleToggleAdmin = async (targetUser: AdminUser) => {
    setSavingUserId(targetUser.id);
    try {
      const payload = await updateAdminUser({
        userId: targetUser.id,
        isAdmin: !targetUser.isAdmin,
      });
      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === targetUser.id ? payload.user : currentUser
        )
      );
      toast.success(
        payload.user.isAdmin
          ? `${targetUser.name} を管理者に設定しました`
          : `${targetUser.name} の管理者権限を外しました`
      );
      void loadAdminData(true);
    } catch (updateError) {
      const message =
        updateError instanceof Error ? updateError.message : "管理者設定の更新に失敗しました";
      toast.error(message);
    } finally {
      setSavingUserId(null);
    }
  };

  const sortedUsers = useMemo(
    () =>
      [...users].sort((a, b) => {
        if (a.isAdmin !== b.isAdmin) {
          return a.isAdmin ? -1 : 1;
        }
        return b.createdAt - a.createdAt;
      }),
    [users]
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_22%),radial-gradient(circle_at_right,_rgba(16,185,129,0.12),_transparent_26%),linear-gradient(180deg,#020617_0%,#071124_42%,#0f172a_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1520px] gap-6 px-4 py-4 md:px-6 lg:px-8">
        <aside className="hidden w-[270px] shrink-0 rounded-[2rem] border border-white/8 bg-[rgba(8,14,24,0.78)] p-6 shadow-[0_24px_80px_rgba(2,6,23,0.45)] lg:block">
          <div className="rounded-[1.5rem] border border-emerald-400/12 bg-[linear-gradient(180deg,rgba(16,185,129,0.16),rgba(15,23,42,0.12))] p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-2">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate-400">
                  admin console
                </p>
                <h1 className="mt-1 font-mono text-xl font-semibold text-white">
                  運用ダッシュボード
                </h1>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              ブランドサイトとは切り離した、運用向けの管理画面です。権限管理と診断状況をここで確認できます。
            </p>
          </div>

          <div className="mt-6 space-y-2">
            <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
              <div className="flex items-center gap-3">
                <LayoutDashboard className="h-4 w-4 text-cyan-300" />
                <span className="font-mono text-sm text-slate-200">Dashboard</span>
              </div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
              <div className="flex items-center gap-3">
                <UserCog className="h-4 w-4 text-cyan-300" />
                <span className="font-mono text-sm text-slate-200">User Control</span>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-white/8 bg-[rgba(255,255,255,0.03)] p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate-500">
              signed in
            </p>
            <p className="mt-3 text-lg font-semibold text-white">{user?.name ?? "-"}</p>
            <p className="mt-1 break-all text-sm text-slate-400">{user?.email ?? "-"}</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Crown className="h-3.5 w-3.5" />
              Owner Access
            </div>
          </div>

          <Button
            className="mt-6 h-11 w-full rounded-2xl border border-white/10 bg-white/5 font-mono text-slate-100 hover:bg-white/10"
            variant="outline"
            asChild
          >
            <a href="/">サイトへ戻る</a>
          </Button>
        </aside>

        <main className="flex-1 space-y-6">
          <section className="rounded-[2rem] border border-white/8 bg-[linear-gradient(135deg,rgba(8,14,24,0.92),rgba(13,23,42,0.88))] p-6 shadow-[0_30px_90px_rgba(2,6,23,0.4)]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Admin Workspace
                </div>
                <h2 className="mt-4 font-mono text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  ユーザー管理と診断状況をひと目で確認
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400 md:text-base">
                  管理者付与、登録ユーザー確認、診断の利用状況を同じ画面で扱えるようにしました。Cloudflare の環境設定で付与された管理者も識別して表示します。
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-2xl border-white/10 bg-white/5 font-mono text-slate-100 hover:bg-white/10"
                onClick={() => void loadAdminData(true)}
                disabled={isRefreshing}
              >
                <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                更新
              </Button>
            </div>
          </section>

          {error && (
            <section className="rounded-[1.5rem] border border-rose-400/20 bg-rose-400/10 px-5 py-4 text-sm text-rose-100">
              {error}
            </section>
          )}

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <StatCard title="Total Users" value={summary.totalUsers} description="現在登録されているユーザー数" icon={Users} />
            <StatCard title="Total Diagnoses" value={summary.totalDiagnoses} description="保存済み診断結果の総数" icon={Activity} />
            <StatCard title="Active Users" value={summary.activeUsers} description="1回以上診断したユニークユーザー" icon={BarChart3} />
            <StatCard title="Admin Count" value={summary.adminCount} description="現在の管理者数" icon={ShieldCheck} />
            <StatCard title="Avg / User" value={summary.avgDiagnosesPerUser} description="1ユーザーあたり平均診断数" icon={LayoutDashboard} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
            <Card className="border-white/8 bg-[rgba(8,14,24,0.86)] text-slate-100 shadow-[0_24px_80px_rgba(2,6,23,0.34)]">
              <CardHeader>
                <CardTitle className="font-mono text-lg text-white">利用推移</CardTitle>
                <CardDescription className="text-slate-400">
                  直近14日間のユーザー登録数と診断実行数
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[280px] rounded-2xl border border-white/8 bg-white/3" />
                ) : (
                  <ChartContainer
                    className="h-[280px] w-full"
                    config={{
                      users: { label: "新規ユーザー", color: "#38bdf8" },
                      diagnoses: { label: "診断数", color: "#34d399" },
                    }}
                  >
                    <LineChart data={trends}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={formatDay} tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                      <ChartTooltip content={<ChartTooltipContent labelFormatter={(label) => formatDay(String(label))} />} />
                      <Line type="monotone" dataKey="users" stroke="var(--color-users)" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="diagnoses" stroke="var(--color-diagnoses)" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card className="border-white/8 bg-[rgba(8,14,24,0.86)] text-slate-100 shadow-[0_24px_80px_rgba(2,6,23,0.34)]">
              <CardHeader>
                <CardTitle className="font-mono text-lg text-white">部署分布</CardTitle>
                <CardDescription className="text-slate-400">
                  上位部署の登録人数
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {topDepartments.length === 0 ? (
                  <p className="text-sm text-slate-500">まだユーザーデータがありません。</p>
                ) : (
                  topDepartments.map((department) => (
                    <div key={department.department} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="truncate text-slate-300">{department.department}</span>
                        <span className="font-mono text-slate-100">{department.count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/8">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,#34d399,#38bdf8)]"
                          style={{
                            width: `${(department.count / Math.max(topDepartments[0]?.count ?? 1, 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
            <Card className="border-white/8 bg-[rgba(8,14,24,0.86)] text-slate-100 shadow-[0_24px_80px_rgba(2,6,23,0.34)]">
              <CardHeader>
                <CardTitle className="font-mono text-lg text-white">人気タイプ</CardTitle>
                <CardDescription className="text-slate-400">
                  診断結果の上位タイプ
                </CardDescription>
              </CardHeader>
              <CardContent>
                {topTypes.length === 0 ? (
                  <p className="text-sm text-slate-500">診断結果がまだありません。</p>
                ) : (
                  <ChartContainer className="h-[300px] w-full" config={{ count: { label: "診断数", color: "#a78bfa" } }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topTypes.map((item) => ({
                          ...item,
                          typeName: typeNameById[item.typeId] ?? item.typeId,
                        }))}
                        layout="vertical"
                        margin={{ left: 10, right: 10 }}
                      >
                        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="typeName" width={110} tickLine={false} axisLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="var(--color-count)" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card className="border-white/8 bg-[rgba(8,14,24,0.86)] text-slate-100 shadow-[0_24px_80px_rgba(2,6,23,0.34)]">
              <CardHeader>
                <CardTitle className="font-mono text-lg text-white">ユーザー一覧と権限管理</CardTitle>
                <CardDescription className="text-slate-400">
                  管理者権限の付与・解除。環境変数で付与された管理者は目印つきで表示します。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-2">
                  <Table className="font-mono text-sm">
                    <TableHeader>
                      <TableRow className="border-white/8 hover:bg-transparent">
                        <TableHead className="h-11 px-4 text-slate-400">User</TableHead>
                        <TableHead className="px-4 text-slate-400">Org</TableHead>
                        <TableHead className="px-4 text-slate-400">Role</TableHead>
                        <TableHead className="px-4 text-slate-400">Joined</TableHead>
                        <TableHead className="px-4 text-right text-slate-400">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedUsers.map((listedUser) => (
                        <TableRow key={listedUser.id} className="border-white/6 hover:bg-white/[0.03]">
                          <TableCell className="px-4 py-4 whitespace-normal">
                            <div className="space-y-1">
                              <p className="font-semibold text-white">{listedUser.name}</p>
                              <p className="break-all text-xs text-slate-400">{listedUser.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-4 whitespace-normal">
                            <div className="space-y-1 text-xs text-slate-400">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-3.5 w-3.5" />
                                <span>{listedUser.department || "未設定"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Briefcase className="h-3.5 w-3.5" />
                                <span>{listedUser.jobTitle || "未設定"}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              {listedUser.isAdmin && (
                                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                                  Admin
                                </span>
                              )}
                              {listedUser.isEnvAdmin && (
                                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold text-cyan-300">
                                  Env
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-4 text-xs text-slate-400">
                            {new Date(listedUser.createdAt).toLocaleDateString("ja-JP")}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-right">
                            <Button
                              type="button"
                              variant="outline"
                              className="h-9 rounded-xl border-white/10 bg-white/5 text-xs text-slate-100 hover:bg-white/10"
                              disabled={savingUserId === listedUser.id}
                              onClick={() => void handleToggleAdmin(listedUser)}
                            >
                              {savingUserId === listedUser.id
                                ? "保存中..."
                                : listedUser.isAdmin
                                  ? "権限を外す"
                                  : "管理者にする"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="border-white/8 bg-[rgba(8,14,24,0.86)] text-slate-100 shadow-[0_24px_80px_rgba(2,6,23,0.34)]">
              <CardHeader>
                <CardTitle className="font-mono text-lg text-white">運用メモ</CardTitle>
                <CardDescription className="text-slate-400">
                  Secret 管理と権限付与のルール
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-7 text-slate-400">
                <p>`Env` バッジは Cloudflare の `ADMIN_EMAILS` / `ADMIN_GOOGLE_SUBS` で付与された管理者です。</p>
                <p>画面上の管理者付与は `users.is_admin` に保存されます。環境変数の管理者と併用できます。</p>
                <p>自分自身の管理者権限は外せないようにしてあり、誤操作で締め出されるのを防いでいます。</p>
              </CardContent>
            </Card>

            <Card className="border-white/8 bg-[rgba(8,14,24,0.86)] text-slate-100 shadow-[0_24px_80px_rgba(2,6,23,0.34)]">
              <CardHeader>
                <CardTitle className="font-mono text-lg text-white">連絡先</CardTitle>
                <CardDescription className="text-slate-400">
                  現在ログイン中の管理者アカウント
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/10 p-2">
                      <Mail className="h-4 w-4 text-cyan-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{user?.name ?? "-"}</p>
                      <p className="mt-1 break-all text-sm text-slate-400">{user?.email ?? "-"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}
