import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  Briefcase,
  Building2,
  Crown,
  RefreshCcw,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
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

function MetricCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {title}
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
        </div>
        <div className="rounded-2xl bg-slate-950 p-3 text-white">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function AccessBadge({ user }: { user: AdminUser }) {
  if (user.isOwner) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
        <Crown className="h-3.5 w-3.5" />
        Owner
      </span>
    );
  }

  if (user.isAdmin) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-900">
        <ShieldCheck className="h-3.5 w-3.5" />
        Admin
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
      User
    </span>
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

  const sortedUsers = useMemo(
    () =>
      [...users].sort((a, b) => {
        const weight = (target: AdminUser) => {
          if (target.isOwner) return 2;
          if (target.isAdmin) return 1;
          return 0;
        };

        const diff = weight(b) - weight(a);
        if (diff !== 0) {
          return diff;
        }

        return b.createdAt - a.createdAt;
      }),
    [users]
  );

  const handleToggleAdmin = async (targetUser: AdminUser) => {
    if (targetUser.isOwner) {
      toast.error("オーナー権限は画面から変更できません");
      return;
    }

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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <section className="rounded-3xl bg-slate-950 px-5 py-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)] md:px-8 md:py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Admin Console
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                シンプルな管理ページ
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                オーナーと管理者を分け、ユーザー管理と診断状況を縦に追いやすい構成へ整理しました。スマホでもセクションごとに見やすくなっています。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl bg-white/8 px-4 py-3 text-sm">
                <p className="font-semibold">{user?.name ?? "-"}</p>
                <p className="mt-1 text-slate-300">
                  {user?.isOwner ? "Owner" : "Admin"}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-2xl border-white/15 bg-white/6 text-white hover:bg-white/12"
                onClick={() => void loadAdminData(true)}
                disabled={isRefreshing}
              >
                <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                更新
              </Button>
            </div>
          </div>
        </section>

        {error && (
          <section className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </section>
        )}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard title="Users" value={summary.totalUsers} icon={Users} />
          <MetricCard title="Diagnoses" value={summary.totalDiagnoses} icon={Activity} />
          <MetricCard title="Active Users" value={summary.activeUsers} icon={TrendingUp} />
          <MetricCard title="Admins" value={summary.adminCount} icon={ShieldCheck} />
          <MetricCard title="Avg / User" value={summary.avgDiagnosesPerUser} icon={Briefcase} />
        </section>

        <section className="mt-6 space-y-6">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>診断利用の推移</CardTitle>
              <CardDescription>直近14日間のユーザー登録数と診断実行数です。</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[260px] rounded-2xl bg-slate-100" />
              ) : (
                <ChartContainer
                  className="h-[260px] w-full"
                  config={{
                    users: { label: "新規ユーザー", color: "#0f172a" },
                    diagnoses: { label: "診断数", color: "#10b981" },
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

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>人気タイプ</CardTitle>
                <CardDescription>診断結果の上位タイプです。</CardDescription>
              </CardHeader>
              <CardContent>
                {topTypes.length === 0 ? (
                  <p className="text-sm text-slate-500">診断結果がまだありません。</p>
                ) : (
                  <ChartContainer className="h-[280px] w-full" config={{ count: { label: "診断数", color: "#2563eb" } }}>
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

            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>部署分布</CardTitle>
                <CardDescription>登録ユーザーの多い部署です。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {topDepartments.length === 0 ? (
                  <p className="text-sm text-slate-500">まだユーザーデータがありません。</p>
                ) : (
                  topDepartments.map((department) => (
                    <div key={department.department} className="space-y-2">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate text-slate-700">{department.department}</span>
                        <span className="font-semibold text-slate-950">{department.count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-slate-900"
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
          </div>
        </section>

        <section className="mt-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">ユーザー管理</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              オーナーは絶対権限で、画面から変更できません。管理者はオーナーより下位ですが、管理者ページ閲覧と管理者付与・解除ができます。
            </p>
          </div>

          <div className="grid gap-3 md:hidden">
            {sortedUsers.map((listedUser) => (
              <Card key={listedUser.id} className="border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{listedUser.name}</p>
                      <p className="mt-1 break-all text-sm text-slate-500">{listedUser.email}</p>
                    </div>
                    <AccessBadge user={listedUser} />
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>{listedUser.department || "部署未設定"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      <span>{listedUser.jobTitle || "職種未設定"}</span>
                    </div>
                  </div>

                  {listedUser.isEnvAdmin && (
                    <p className="text-xs text-slate-500">
                      Cloudflare の環境設定による権限が有効です。
                    </p>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full rounded-xl"
                    disabled={savingUserId === listedUser.id || listedUser.isOwner}
                    onClick={() => void handleToggleAdmin(listedUser)}
                  >
                    {listedUser.isOwner
                      ? "オーナーは変更不可"
                      : savingUserId === listedUser.id
                        ? "保存中..."
                        : listedUser.isAdmin
                          ? "管理者権限を外す"
                          : "管理者にする"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="hidden border-slate-200 bg-white shadow-sm md:block">
            <CardContent className="p-3">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ユーザー</TableHead>
                    <TableHead>部署 / 職種</TableHead>
                    <TableHead>権限</TableHead>
                    <TableHead>登録日</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedUsers.map((listedUser) => (
                    <TableRow key={listedUser.id}>
                      <TableCell className="py-4 whitespace-normal">
                        <div>
                          <p className="font-semibold text-slate-950">{listedUser.name}</p>
                          <p className="mt-1 break-all text-xs text-slate-500">{listedUser.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 whitespace-normal">
                        <div className="space-y-1 text-sm text-slate-600">
                          <p>{listedUser.department || "部署未設定"}</p>
                          <p>{listedUser.jobTitle || "職種未設定"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <AccessBadge user={listedUser} />
                          {listedUser.isEnvAdmin && (
                            <span className="inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-800">
                              Env
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-sm text-slate-600">
                        {new Date(listedUser.createdAt).toLocaleDateString("ja-JP")}
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-xl"
                          disabled={savingUserId === listedUser.id || listedUser.isOwner}
                          onClick={() => void handleToggleAdmin(listedUser)}
                        >
                          {listedUser.isOwner
                            ? "変更不可"
                            : savingUserId === listedUser.id
                              ? "保存中..."
                              : listedUser.isAdmin
                                ? "解除"
                                : "付与"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
