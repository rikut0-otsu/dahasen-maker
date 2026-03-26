import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  Briefcase,
  Building2,
  Crown,
  Download,
  Filter,
  PieChart as PieChartIcon,
  RefreshCcw,
  Search,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import {
  deleteAdminUser,
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
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const PAGE_SIZE = 10;
const TYPE_PAGE_SIZE = 5;
const PIE_COLORS = ["#0f172a", "#10b981", "#2563eb", "#f59e0b", "#ef4444", "#8b5cf6"];

const typeMetaById = Object.fromEntries(
  typesData.map((type) => [type.id, { name: type.name, era: type.era }])
) as Record<string, { name: string; era: string }>;

function formatDay(date: string) {
  return new Date(date).toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
  });
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
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

function MetricCard({
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
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {title}
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <div className="rounded-2xl bg-[linear-gradient(135deg,#0f172a,#1d4ed8)] p-3 text-white shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function PieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0];
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg">
      <p className="font-medium text-slate-900">{item.name}</p>
      <p className="mt-1 text-slate-600">{item.value ?? 0} 件</p>
    </div>
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
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "owner" | "admin" | "user">("all");
  const [sortKey, setSortKey] = useState<"newest" | "oldest" | "name">("newest");
  const [page, setPage] = useState(1);
  const [typePage, setTypePage] = useState(1);

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

  const filteredUsers = useMemo(() => {
    const normalized = searchText.trim().toLowerCase();

    return [...users]
      .filter((target) => {
        if (roleFilter === "owner" && !target.isOwner) return false;
        if (roleFilter === "admin" && (target.isOwner || !target.isAdmin)) return false;
        if (roleFilter === "user" && target.isAdmin) return false;

        if (!normalized) return true;

        return [target.name, target.email, target.department, target.jobTitle]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalized));
      })
      .sort((a, b) => {
        if (sortKey === "name") return a.name.localeCompare(b.name, "ja");
        if (sortKey === "oldest") return a.createdAt - b.createdAt;

        const weight = (target: AdminUser) => {
          if (target.isOwner) return 2;
          if (target.isAdmin) return 1;
          return 0;
        };

        const accessDiff = weight(b) - weight(a);
        if (accessDiff !== 0) return accessDiff;
        return b.createdAt - a.createdAt;
      });
  }, [users, searchText, roleFilter, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const pagedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [searchText, roleFilter, sortKey]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const eraBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of topTypes) {
      const era = typeMetaById[item.typeId]?.era ?? "other";
      map.set(era, (map.get(era) ?? 0) + item.count);
    }

    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [topTypes]);

  const personBreakdown = useMemo(
    () =>
      topTypes.map((item) => ({
        name: typeMetaById[item.typeId]?.name ?? item.typeId,
        value: item.count,
      })),
    [topTypes]
  );

  const allTypeCounts = useMemo(() => {
    const countMap = new Map(topTypes.map((item) => [item.typeId, item.count]));

    return typesData
      .map((type) => ({
        typeId: type.id,
        typeName: type.name,
        era: type.eraLabel,
        count: countMap.get(type.id) ?? 0,
      }))
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }

        return a.typeName.localeCompare(b.typeName, "ja");
      });
  }, [topTypes]);

  const totalTypePages = Math.max(1, Math.ceil(allTypeCounts.length / TYPE_PAGE_SIZE));
  const pagedTypeCounts = allTypeCounts.slice(
    (typePage - 1) * TYPE_PAGE_SIZE,
    typePage * TYPE_PAGE_SIZE
  );

  useEffect(() => {
    if (typePage > totalTypePages) {
      setTypePage(totalTypePages);
    }
  }, [typePage, totalTypePages]);

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

  const handleDeleteUser = async (targetUser: AdminUser) => {
    if (targetUser.isOwner) {
      toast.error("オーナーは削除できません");
      return;
    }

    const confirmed = window.confirm(`${targetUser.name} を削除します。ログイン情報と診断結果も削除されます。`);
    if (!confirmed) {
      return;
    }

    setSavingUserId(targetUser.id);
    try {
      await deleteAdminUser({ userId: targetUser.id });
      setUsers((currentUsers) => currentUsers.filter((currentUser) => currentUser.id !== targetUser.id));
      toast.success(`${targetUser.name} を削除しました`);
      void loadAdminData(true);
    } catch (deleteError) {
      const message =
        deleteError instanceof Error ? deleteError.message : "ユーザー削除に失敗しました";
      toast.error(message);
    } finally {
      setSavingUserId(null);
    }
  };

  const exportUsersCsv = () => {
    downloadCsv("admin-users.csv", [
      ["name", "email", "access", "department", "jobTitle", "createdAt"],
      ...filteredUsers.map((target) => [
        target.name,
        target.email,
        target.isOwner ? "owner" : target.isAdmin ? "admin" : "user",
        target.department || "",
        target.jobTitle || "",
        new Date(target.createdAt).toISOString(),
      ]),
    ]);
  };

  const exportDiagnosisCsv = () => {
    downloadCsv("diagnosis-summary.csv", [
      ["typeId", "typeName", "era", "count"],
      ...allTypeCounts.map((target) => [
        target.typeId,
        target.typeName,
        target.era,
        String(target.count),
      ]),
    ]);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef4ff_48%,#f8fafc_100%)] text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <section className="rounded-[2rem] bg-[linear-gradient(135deg,#0f172a,#1d4ed8_55%,#38bdf8)] px-5 py-6 text-white shadow-[0_20px_70px_rgba(37,99,235,0.22)] md:px-8 md:py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/80">
                Operation Dashboard
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                管理者向け運用ページ
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-100/90">
                登録ユーザーの管理、管理者権限の付与・解除、診断結果の集計確認をひとつの画面で行えるようにしています。オーナーは固定権限で、管理者はその下位権限として扱います。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl bg-white/12 px-4 py-3 text-sm backdrop-blur-sm">
                <p className="font-semibold">{user?.name ?? "-"}</p>
                <p className="mt-1 text-cyan-50/80">{user?.isOwner ? "Owner" : "Admin"}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/16"
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

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Users" value={summary.totalUsers} description="登録ユーザー数" icon={Users} />
          <MetricCard title="Diagnoses" value={summary.totalDiagnoses} description="保存済み診断結果数" icon={Activity} />
          <MetricCard title="Admins" value={summary.adminCount} description="オーナーを含む管理権限ユーザー数" icon={ShieldCheck} />
          <MetricCard title="Departments" value={topDepartments.length} description="現在登録されている主要部署数" icon={Building2} />
        </section>

        <section className="mt-6 space-y-6">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>診断結果の推移</CardTitle>
              <CardDescription>直近14日間の新規登録数と診断実行数です。</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[260px] rounded-2xl bg-slate-100" />
              ) : (
                <ChartContainer
                  className="h-[260px] w-full"
                  config={{
                    users: { label: "新規ユーザー", color: "#1d4ed8" },
                    diagnoses: { label: "診断数", color: "#0f172a" },
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
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4 text-blue-600" />
                  時代別の構成比
                </CardTitle>
                <CardDescription>江戸・戦国・幕末・平安など、時代セグメントの割合です。</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={eraBreakdown} dataKey="value" nameKey="name" innerRadius={52} outerRadius={96}>
                      {eraBreakdown.map((item, index) => (
                        <Cell key={item.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4 text-blue-600" />
                  人物別の構成比
                </CardTitle>
                <CardDescription>診断結果の人物別割合です。</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={personBreakdown} dataKey="value" nameKey="name" innerRadius={42} outerRadius={96}>
                      {personBreakdown.map((item, index) => (
                        <Cell key={item.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="md:flex-row md:items-end md:justify-between">
              <div>
                <CardTitle>人物別ランキング</CardTitle>
                <CardDescription>
                  全タイプを対象に、5件ずつ表示します。0件のタイプも確認できます。
                </CardDescription>
              </div>
              <Button type="button" variant="outline" className="rounded-xl" onClick={exportDiagnosisCsv}>
                <Download className="mr-2 h-4 w-4" />
                集計CSV
              </Button>
            </CardHeader>
            <CardContent>
              <ChartContainer className="h-[320px] w-full" config={{ count: { label: "診断数", color: "#2563eb" } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={pagedTypeCounts}
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

              <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                <p>
                  {allTypeCounts.length} タイプ中 {(typePage - 1) * TYPE_PAGE_SIZE + 1} - {Math.min(typePage * TYPE_PAGE_SIZE, allTypeCounts.length)} 件を表示
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    disabled={typePage === 1}
                    onClick={() => setTypePage((current) => current - 1)}
                  >
                    前へ
                  </Button>
                  <span className="min-w-16 text-center">
                    {typePage} / {totalTypePages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    disabled={typePage === totalTypePages}
                    onClick={() => setTypePage((current) => current + 1)}
                  >
                    次へ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-6 space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">ユーザー一覧</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                オーナーは固定権限です。管理者はその下位権限で、管理者ページ閲覧と管理者付与・解除ができます。ユーザーは10件ずつ表示し、検索・絞り込み・並び替えに対応しています。
              </p>
            </div>
            <Button type="button" variant="outline" className="rounded-xl" onClick={exportUsersCsv}>
              <Download className="mr-2 h-4 w-4" />
              ユーザーCSV
            </Button>
          </div>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-4 md:p-5">
              <div className="grid gap-3 md:grid-cols-[1.3fr_0.8fr_0.8fr]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder="名前・メール・部署・職種で検索"
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <select
                    value={roleFilter}
                    onChange={(event) => setRoleFilter(event.target.value as typeof roleFilter)}
                    className="h-11 w-full bg-transparent text-sm outline-none"
                  >
                    <option value="all">すべての権限</option>
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <select
                    value={sortKey}
                    onChange={(event) => setSortKey(event.target.value as typeof sortKey)}
                    className="h-11 w-full bg-transparent text-sm outline-none"
                  >
                    <option value="newest">新しい順</option>
                    <option value="oldest">古い順</option>
                    <option value="name">名前順</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 md:hidden">
                {pagedUsers.map((listedUser) => (
                  <div key={listedUser.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{listedUser.name}</p>
                        <p className="mt-1 break-all text-sm text-slate-500">{listedUser.email}</p>
                      </div>
                      <AccessBadge user={listedUser} />
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>{listedUser.department || "部署未設定"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        <span>{listedUser.jobTitle || "職種未設定"}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 rounded-xl"
                        disabled={savingUserId === listedUser.id || listedUser.isOwner}
                        onClick={() => void handleToggleAdmin(listedUser)}
                      >
                        {listedUser.isOwner
                          ? "変更不可"
                          : listedUser.isAdmin
                            ? "管理者解除"
                            : "管理者付与"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50"
                        disabled={savingUserId === listedUser.id || listedUser.isOwner}
                        onClick={() => void handleDeleteUser(listedUser)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block">
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
                    {pagedUsers.map((listedUser) => (
                      <TableRow key={listedUser.id}>
                        <TableCell className="py-4 whitespace-normal">
                          <p className="font-semibold text-slate-950">{listedUser.name}</p>
                          <p className="mt-1 break-all text-xs text-slate-500">{listedUser.email}</p>
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
                        <TableCell className="py-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-xl"
                              disabled={savingUserId === listedUser.id || listedUser.isOwner}
                              onClick={() => void handleToggleAdmin(listedUser)}
                            >
                              {listedUser.isOwner
                                ? "変更不可"
                                : listedUser.isAdmin
                                  ? "解除"
                                  : "付与"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50"
                              disabled={savingUserId === listedUser.id || listedUser.isOwner}
                              onClick={() => void handleDeleteUser(listedUser)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-sm text-slate-600">
                <p>
                  {filteredUsers.length} 件中 {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, filteredUsers.length)} 件を表示
                </p>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" className="rounded-xl" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>
                    前へ
                  </Button>
                  <span className="min-w-16 text-center">
                    {page} / {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    disabled={page === totalPages}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    次へ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
