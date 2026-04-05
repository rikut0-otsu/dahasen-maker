import type { AppContext } from "../../_lib/cloudflare";
import { resolveAdminStatus } from "../../_lib/admin";
import { requireAdminUser } from "../../_lib/auth";
import {
  getDashboardDiagnoses,
  getDashboardUsers,
  getLatestDiagnosesForUsers,
} from "../../_lib/db";
import { json } from "../../_lib/http";

function dayKey(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export async function onRequestGet(context: AppContext) {
  const auth = await requireAdminUser(context);
  if (!auth.ok) {
    return auth.response;
  }

  const [users, diagnoses] = await Promise.all([
    getDashboardUsers(context.env.DB),
    getDashboardDiagnoses(context.env.DB),
  ]);
  const latestDiagnoses = await getLatestDiagnosesForUsers(
    context.env.DB,
    users.map((user) => user.id)
  );

  const totalUsers = users.length;
  const totalDiagnoses = diagnoses.length;
  const activeUsers = new Set(diagnoses.map((diagnosis) => diagnosis.user_id)).size;
  const adminCount = users.filter((user) =>
    resolveAdminStatus(context.env, {
      googleSub: user.google_sub,
      email: user.email,
      persistedIsAdmin: user.is_admin,
    })
  ).length;

  const usersByDay = new Map<string, number>();
  for (const user of users) {
    const key = dayKey(user.created_at);
    usersByDay.set(key, (usersByDay.get(key) ?? 0) + 1);
  }

  const diagnosesByDay = new Map<string, number>();
  for (const diagnosis of diagnoses) {
    const key = dayKey(diagnosis.created_at);
    diagnosesByDay.set(key, (diagnosesByDay.get(key) ?? 0) + 1);
  }

  const trendDates = Array.from(usersByDay.keys()).concat(Array.from(diagnosesByDay.keys()));
  const trends = Array.from(new Set(trendDates))
    .sort()
    .slice(-120)
    .map((date) => ({
      date,
      users: usersByDay.get(date) ?? 0,
      diagnoses: diagnosesByDay.get(date) ?? 0,
    }));

  const typeCounts = Array.from(
    Array.from(latestDiagnoses.values()).reduce((map, diagnosis) => {
      map.set(diagnosis.type_id, (map.get(diagnosis.type_id) ?? 0) + 1);
      return map;
    }, new Map<string, number>())
  )
    .sort((a, b) => b[1] - a[1])
    .map(([typeId, count]) => ({ typeId, count }));

  const topTypes = typeCounts.slice(0, 8);

  const topDepartments = Array.from(
    users.reduce((map, user) => {
      const department = user.department?.trim() || "未設定";
      map.set(department, (map.get(department) ?? 0) + 1);
      return map;
    }, new Map<string, number>())
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([department, count]) => ({ department, count }));

  return json({
    summary: {
      totalUsers,
      totalDiagnoses,
      activeUsers,
      adminCount,
      avgDiagnosesPerUser:
        totalUsers === 0 ? 0 : Number((totalDiagnoses / totalUsers).toFixed(2)),
    },
    trends,
    topTypes,
    typeCounts,
    topDepartments,
  });
}
