import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarRange,
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
import { useLocation } from "wouter";
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
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const PAGE_SIZE = 10;
const TYPE_PAGE_SIZE = 4;
const PIE_COLORS = ["#0f172a", "#10b981", "#2563eb", "#f59e0b", "#ef4444", "#8b5cf6"];
const TREND_FILTERS = [
  { key: "7d", label: "7日" },
  { key: "14d", label: "14日" },
  { key: "30d", label: "30日" },
  { key: "all", label: "全期間" },
] as const;
const PIE_TABS = [
  { key: "era", label: "時代別" },
  { key: "person", label: "人物別" },
  { key: "joinYear", label: "入社年別" },
  { key: "department", label: "部署別" },
  { key: "jobTitle", label: "職種別" },
] as const;
const ADMIN_OUTLINE_BUTTON =
  "rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200";
const ADMIN_ACTIVE_BUTTON =
  "!border-slate-900 !bg-slate-900 !text-white hover:!bg-slate-900 hover:!text-white active:!bg-slate-900";
const ADMIN_CHART_CLASS =
  "h-[320px] w-full [&_.recharts-cartesian-axis-tick_text]:fill-slate-500 [&_.recharts-polar-angle-axis-tick_text]:fill-slate-500 [&_.recharts-default-tooltip]:border-slate-200 [&_.recharts-default-tooltip]:bg-white [&_.recharts-default-tooltip]:text-slate-900 [&_.recharts-tooltip-wrapper]:outline-none";
const ADMIN_LINE_CHART_CLASS =
  "h-[260px] w-full [&_.recharts-cartesian-axis-tick_text]:fill-slate-500 [&_.recharts-cartesian-grid_line]:stroke-slate-200 [&_.recharts-default-tooltip]:border-slate-200 [&_.recharts-default-tooltip]:bg-white [&_.recharts-default-tooltip]:text-slate-900 [&_.recharts-tooltip-wrapper]:outline-none";

const typeMetaById = Object.fromEntries(
  typesData.map((type) => [type.id, { name: type.name, era: type.era, eraLabel: type.eraLabel }])
) as Record<string, { name: string; era: string; eraLabel: string }>;

function formatDay(date: string) {
  return new Date(date).toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
  });
}

function formatDateTime(value: number) {
  return new Date(value).toLocaleString("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

function formatJoinYear(joinYear?: number | null) {
  if (joinYear == null) {
    return "入社年未設定";
  }

  return `${String(joinYear).padStart(2, "0")}年入社`;
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
  const [, setLocation] = useLocation();
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
  const [diagnosisFilter, setDiagnosisFilter] = useState("all");
  const [eraFilter, setEraFilter] = useState("all");
  const [sortKey, setSortKey] = useState<"newest" | "oldest" | "name">("newest");
  const [page, setPage] = useState(1);
  const [typePage, setTypePage] = useState(1);
  const [trendRange, setTrendRange] = useState<(typeof TREND_FILTERS)[number]["key"]>("14d");
  const [pieTab, setPieTab] = useState<(typeof PIE_TABS)[number]["key"]>("era");
  const [showPieLabels, setShowPieLabels] = useState(false);

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

        if (diagnosisFilter === "none" && target.latestDiagnosis) return false;
        if (diagnosisFilter !== "all" && diagnosisFilter !== "none" && target.latestDiagnosis?.typeId !== diagnosisFilter) {
          return false;
        }

        const targetEra = target.latestDiagnosis
          ? (typeMetaById[target.latestDiagnosis.typeId]?.era ?? "other")
          : null;
        if (eraFilter === "none" && target.latestDiagnosis) return false;
        if (eraFilter !== "all" && eraFilter !== "none" && targetEra !== eraFilter) {
          return false;
        }

        if (!normalized) return true;

        return [
          target.name,
          target.email,
          target.department,
          target.jobTitle,
          target.joinYear != null ? formatJoinYear(target.joinYear) : null,
        ]
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
  }, [users, searchText, roleFilter, diagnosisFilter, eraFilter, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const pagedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [searchText, roleFilter, diagnosisFilter, eraFilter, sortKey]);

  const diagnosisFilterOptions = useMemo(
    () => [
      { value: "all", label: "すべての診断結果" },
      { value: "none", label: "未診断" },
      ...typesData.map((type) => ({
        value: type.id,
        label: type.name,
      })),
    ],
    []
  );

  const eraFilterOptions = useMemo(
    () => [
      { value: "all", label: "すべての時代" },
      { value: "none", label: "未診断" },
      ...Array.from(
        new Map(typesData.map((type) => [type.era, type.eraLabel])).entries()
      ).map(([value, label]) => ({ value, label })),
    ],
    []
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const eraBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of topTypes) {
      const era = typeMetaById[item.typeId]?.eraLabel ?? "その他";
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

  const departmentBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const target of users) {
      const key = target.department?.trim() || "未設定";
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [users]);

  const joinYearBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const target of users) {
      const key = formatJoinYear(target.joinYear);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => {
        if (a.name === "入社年未設定") return 1;
        if (b.name === "入社年未設定") return -1;
        return a.name.localeCompare(b.name, "ja");
      });
  }, [users]);

  const jobTitleBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const target of users) {
      const key = target.jobTitle?.trim() || "未設定";
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [users]);

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

  const trendData = useMemo(() => {
    if (trendRange === "all") {
      return trends;
    }

    const limit = trendRange === "7d" ? 7 : trendRange === "14d" ? 14 : 30;
    return trends.slice(-limit);
  }, [trendRange, trends]);

  const pieData = useMemo(() => {
    if (pieTab === "era") return eraBreakdown;
    if (pieTab === "person") return personBreakdown;
    if (pieTab === "joinYear") return joinYearBreakdown;
    if (pieTab === "department") return departmentBreakdown;
    return jobTitleBreakdown;
  }, [pieTab, eraBreakdown, personBreakdown, joinYearBreakdown, departmentBreakdown, jobTitleBreakdown]);

  const pieTotal = useMemo(
    () => pieData.reduce((sum, item) => sum + item.value, 0),
    [pieData]
  );

  const renderPieLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    percent,
    name,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    outerRadius: number;
    percent: number;
    name: string;
  }) => {
    if (!showPieLabels || percent <= 0) {
      return null;
    }

    const radius = outerRadius + 26;
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);
    const anchor = x > cx ? "start" : "end";

    return (
      <text
        x={x}
        y={y}
        fill="#0f172a"
        textAnchor={anchor}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${name} ${Math.round(percent * 1000) / 10}%`}
      </text>
    );
  };

  const ownerUsers = useMemo(() => users.filter((target) => target.isOwner), [users]);

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
      ["name", "email", "access", "joinYear", "department", "jobTitle", "latestType", "latestDiagnosisAt", "createdAt"],
      ...filteredUsers.map((target) => [
        target.name,
        target.email,
        target.isOwner ? "owner" : target.isAdmin ? "admin" : "user",
        target.joinYear != null ? String(target.joinYear).padStart(2, "0") : "",
        target.department || "",
        target.jobTitle || "",
        target.latestDiagnosis ? typeMetaById[target.latestDiagnosis.typeId]?.name ?? target.latestDiagnosis.typeId : "",
        target.latestDiagnosis ? new Date(target.latestDiagnosis.createdAt).toISOString() : "",
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
      <div className="mx-auto max-w-6xl px-3 py-4 md:px-6 md:py-8">
        <section className="rounded-[1.75rem] bg-[linear-gradient(135deg,#0f172a,#1d4ed8_55%,#38bdf8)] px-4 py-5 text-white shadow-[0_20px_70px_rgba(37,99,235,0.22)] md:rounded-[2rem] md:px-8 md:py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Button
                type="button"
                variant="outline"
                className="mb-4 h-10 w-full rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/16 md:w-auto"
                onClick={() => setLocation("/")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                ホームに戻る
              </Button>
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
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div
                className={`rounded-2xl px-4 py-3 text-sm backdrop-blur-sm ${
                  user?.isOwner
                    ? "border border-amber-200/35 bg-[linear-gradient(135deg,rgba(251,191,36,0.26),rgba(245,158,11,0.14))] text-amber-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
                    : "bg-white/12 text-white"
                }`}
              >
                <p className="font-semibold">{user?.name ?? "-"}</p>
                <p className={`mt-1 ${user?.isOwner ? "text-amber-100/90" : "text-cyan-50/80"}`}>
                  {user?.isOwner ? "Owner" : "Admin"}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/16 sm:w-auto"
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

        {ownerUsers.length === 0 && (
          <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">オーナーが見つかっていません</p>
                <p className="mt-1 leading-6">
                  この画面にオーナーが表示されない場合、Cloudflare の `OWNER_EMAILS` に
                  `otsu_rikuto@cyberagent.co.jp` が入っていない可能性があります。
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Users" value={summary.totalUsers} description="登録ユーザー数" icon={Users} />
          <MetricCard title="Diagnoses" value={summary.totalDiagnoses} description="保存済み診断結果数" icon={Activity} />
          <MetricCard title="Admins" value={summary.adminCount} description="オーナーを含む管理権限ユーザー数" icon={ShieldCheck} />
          <MetricCard title="Departments" value={topDepartments.length} description="現在登録されている主要部署数" icon={Building2} />
        </section>

        <section className="mt-6 space-y-6">
          <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
            <CardHeader className="md:flex-row md:items-end md:justify-between">
              <div>
                <CardTitle className="text-slate-950">診断結果の推移</CardTitle>
                <CardDescription className="text-slate-600">期間を切り替えて新規登録数と診断実行数を確認できます。</CardDescription>
              </div>
              <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap">
                {TREND_FILTERS.map((filter) => (
                  <Button
                    key={filter.key}
                    type="button"
                    variant="outline"
                    className={`${ADMIN_OUTLINE_BUTTON} ${
                      trendRange === filter.key ? ADMIN_ACTIVE_BUTTON : ""
                    }`}
                    onClick={() => setTrendRange(filter.key)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[260px] rounded-2xl bg-slate-100" />
              ) : (
                <ChartContainer
                  className={ADMIN_LINE_CHART_CLASS}
                  config={{
                    users: { label: "新規ユーザー", color: "#1d4ed8" },
                    diagnoses: { label: "診断数", color: "#0f172a" },
                  }}
                >
                  <LineChart data={trendData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatDay} tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          className="border-slate-200 bg-white text-slate-900"
                          labelClassName="text-slate-900"
                          labelFormatter={(label) => formatDay(String(label))}
                        />
                      }
                    />
                    <Line type="monotone" dataKey="users" stroke="var(--color-users)" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="diagnoses" stroke="var(--color-diagnoses)" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-slate-200 bg-white text-slate-900 shadow-sm lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-950">
                  <PieChartIcon className="h-4 w-4 text-blue-600" />
                  円グラフ集計
                </CardTitle>
                <CardDescription className="text-slate-600">
                  時代別・人物別・部署別・職種別を切り替えて、割合を常時確認できます。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap">
                    {PIE_TABS.map((tab) => (
                      <Button
                        key={tab.key}
                        type="button"
                        variant="outline"
                        className={`${ADMIN_OUTLINE_BUTTON} ${
                          pieTab === tab.key ? ADMIN_ACTIVE_BUTTON : ""
                        }`}
                        onClick={() => setPieTab(tab.key)}
                      >
                        {tab.label}
                      </Button>
                    ))}
                  </div>
                  <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    <Switch
                      checked={showPieLabels}
                      onCheckedChange={setShowPieLabels}
                      className="data-[state=unchecked]:border-slate-300 data-[state=unchecked]:bg-slate-300 data-[state=checked]:bg-slate-900 [&_[data-slot=switch-thumb]]:bg-white dark:data-[state=unchecked]:bg-slate-300 dark:data-[state=checked]:bg-slate-900"
                    />
                    <span>円グラフ上に項目名と割合を表示</span>
                  </label>
                </div>

                <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
                  <div className="h-[280px] md:h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={48}
                          outerRadius={110}
                          labelLine={showPieLabels}
                          label={renderPieLabel}
                        >
                          {pieData.map((item, index) => (
                            <Cell key={item.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-2 md:space-y-3">
                    {pieData.length === 0 ? (
                      <p className="text-sm text-slate-500">まだ集計データがありません。</p>
                    ) : (
                      pieData.map((item, index) => {
                        const percent = pieTotal === 0 ? 0 : Math.round((item.value / pieTotal) * 1000) / 10;
                        return (
                          <div key={item.name} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex min-w-0 items-center gap-3">
                                <span
                                  className="h-3 w-3 shrink-0 rounded-full"
                                  style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                                />
                                <span className="truncate text-sm font-medium text-slate-900">{item.name}</span>
                              </div>
                              <div className="text-right text-sm">
                                <p className="font-semibold text-slate-900">{percent}%</p>
                                <p className="text-slate-500">{item.value} 件</p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
            <CardHeader className="gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <CardTitle className="text-slate-950">人物別ランキング</CardTitle>
                <CardDescription className="text-slate-600">
                  全タイプを対象に、4人物ずつ表示します。0件のタイプも確認できます。
                </CardDescription>
              </div>
              <Button type="button" variant="outline" className={`w-full md:w-auto ${ADMIN_OUTLINE_BUTTON}`} onClick={exportDiagnosisCsv}>
                <Download className="mr-2 h-4 w-4" />
                集計CSV
              </Button>
            </CardHeader>
            <CardContent>
              <ChartContainer className={ADMIN_CHART_CLASS} config={{ count: { label: "診断数", color: "#2563eb" } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={pagedTypeCounts}
                    layout="vertical"
                    margin={{ left: 10, right: 10 }}
                  >
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="typeName" width={110} tickLine={false} axisLine={false} />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          className="border-slate-200 bg-white text-slate-900"
                          labelClassName="text-slate-900"
                        />
                      }
                    />
                    <Bar dataKey="count" fill="var(--color-count)" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>

              <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
                <p>
                  {allTypeCounts.length} タイプ中 {(typePage - 1) * TYPE_PAGE_SIZE + 1} - {Math.min(typePage * TYPE_PAGE_SIZE, allTypeCounts.length)} 件を表示
                </p>
                <div className="grid grid-cols-3 items-center gap-2 md:flex md:items-center">
                  <Button
                    type="button"
                    variant="outline"
                    className={ADMIN_OUTLINE_BUTTON}
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
                    className={ADMIN_OUTLINE_BUTTON}
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
            <Button type="button" variant="outline" className={`w-full lg:w-auto ${ADMIN_OUTLINE_BUTTON}`} onClick={exportUsersCsv}>
              <Download className="mr-2 h-4 w-4" />
              ユーザーCSV
            </Button>
          </div>

          <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
            <CardContent className="space-y-4 p-4 md:p-5">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr_0.9fr_0.9fr_1fr_1fr]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder="名前・メール・入社年・部署・職種で検索"
                    autoComplete="off"
                    className="border-slate-200 bg-white pl-10 text-slate-900 placeholder:text-slate-400 autofill:shadow-[inset_0_0_0px_1000px_white] autofill:[-webkit-text-fill-color:#0f172a]"
                  />
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <select
                    value={roleFilter}
                    onChange={(event) => setRoleFilter(event.target.value as typeof roleFilter)}
                    className="h-11 w-full bg-transparent text-sm text-slate-700 outline-none"
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
                    value={diagnosisFilter}
                    onChange={(event) => setDiagnosisFilter(event.target.value)}
                    className="h-11 w-full bg-transparent text-sm text-slate-700 outline-none"
                  >
                    {diagnosisFilterOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <select
                    value={eraFilter}
                    onChange={(event) => setEraFilter(event.target.value)}
                    className="h-11 w-full bg-transparent text-sm text-slate-700 outline-none"
                  >
                    {eraFilterOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <select
                    value={sortKey}
                    onChange={(event) => setSortKey(event.target.value as typeof sortKey)}
                    className="h-11 w-full bg-transparent text-sm text-slate-700 outline-none"
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
                        <CalendarRange className="h-4 w-4" />
                        <span>{formatJoinYear(listedUser.joinYear)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>{listedUser.department || "部署未設定"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        <span>{listedUser.jobTitle || "職種未設定"}</span>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          最新の診断結果
                        </p>
                        {listedUser.latestDiagnosis ? (
                          <>
                            <p className="mt-1 font-medium text-slate-900">
                              {typeMetaById[listedUser.latestDiagnosis.typeId]?.name ?? listedUser.latestDiagnosis.typeId}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {formatDateTime(listedUser.latestDiagnosis.createdAt)}
                            </p>
                          </>
                        ) : (
                          <p className="mt-1 text-xs text-slate-500">診断履歴はまだありません</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className={`flex-1 ${ADMIN_OUTLINE_BUTTON}`}
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
                <Table className="[&_tbody_tr:hover]:bg-slate-50/90 [&_thead_tr]:border-slate-200 [&_tbody_tr]:border-slate-200">
                  <TableHeader className="bg-slate-50/80">
                    <TableRow className="hover:bg-slate-50/80">
                      <TableHead className="text-slate-700">ユーザー</TableHead>
                      <TableHead className="text-slate-700">入社年 / 部署 / 職種</TableHead>
                      <TableHead className="text-slate-700">最新診断</TableHead>
                      <TableHead className="text-slate-700">権限</TableHead>
                      <TableHead className="text-slate-700">登録日</TableHead>
                      <TableHead className="text-right text-slate-700">操作</TableHead>
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
                            <p>{formatJoinYear(listedUser.joinYear)}</p>
                            <p>{listedUser.department || "部署未設定"}</p>
                            <p>{listedUser.jobTitle || "職種未設定"}</p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 whitespace-normal">
                          {listedUser.latestDiagnosis ? (
                            <div className="space-y-1 text-sm text-slate-600">
                              <p className="font-medium text-slate-900">
                                {typeMetaById[listedUser.latestDiagnosis.typeId]?.name ?? listedUser.latestDiagnosis.typeId}
                              </p>
                              <p>{formatDateTime(listedUser.latestDiagnosis.createdAt)}</p>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-400">未診断</p>
                          )}
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
                              className={ADMIN_OUTLINE_BUTTON}
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

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
                <p>
                  {filteredUsers.length} 件中 {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, filteredUsers.length)} 件を表示
                </p>
                <div className="grid grid-cols-3 items-center gap-2 md:flex md:items-center">
                  <Button type="button" variant="outline" className={ADMIN_OUTLINE_BUTTON} disabled={page === 1} onClick={() => setPage((current) => current - 1)}>
                    前へ
                  </Button>
                  <span className="min-w-16 text-center">
                    {page} / {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    className={ADMIN_OUTLINE_BUTTON}
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
