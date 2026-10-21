import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MODULES } from "@/lib/modules";
import { getT } from "@/lib/locale-server";
import { dateLocale, itemLabel } from "@/lib/i18n";
import Charts from "@/components/Charts";

type U = { id: string; email: string | null; phone: string | null };
type Log = { id: number; user_id: string; item: string; value: number | null; count: number | null; note: string | null; created_at: string };

const ITEM = Object.fromEntries(MODULES.flatMap((m) => m.items.map((i) => [i.key, i])));

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ u?: string }> }) {
  const { locale, t } = await getT();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // 这里只是界面层的拦截；真正的权限由后端和数据库行级安全保证
  if (!user || user.app_metadata?.role !== "admin") notFound();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  const api = async (path: string) => {
    const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return r.ok ? r.json() : null;
  };

  const { u } = await searchParams;
  const sel = u ?? "all";
  const [users, stats, logs]: [U[] | null, any, Log[] | null] = await Promise.all([
    api("/api/admin/users"),
    api(`/api/stats?user_id=${encodeURIComponent(sel)}`),
    api(`/api/admin/logs?user_id=${encodeURIComponent(sel)}&days=14`),
  ]);
  const name = (x: U) => x.email ?? x.phone ?? x.id.slice(0, 8);
  const who = Object.fromEntries((users ?? []).map((x) => [x.id, name(x)]));

  const pill = (active: boolean) =>
    `flex h-10 shrink-0 items-center rounded-full border px-4 text-sm ${
      active ? "border-ball-700 bg-ball-500 text-ink" : "border-line text-slate-700"
    }`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
      <h1 className="text-2xl font-semibold">{t("adminTitle")}</h1>
      <p className="mt-1 text-slate-600">{t("adminSub")}</p>

      <nav className="mt-5 flex gap-2 overflow-x-auto pb-1">
        <Link href="/admin?u=all" className={pill(sel === "all")}>{t("allUsers")}</Link>
        {(users ?? []).map((x) => (
          <Link key={x.id} href={`/admin?u=${x.id}`} className={pill(sel === x.id)}>{name(x)}</Link>
        ))}
      </nav>

      <div className="mt-6">
        {stats ? <Charts stats={stats} /> : <p className="text-sm text-red-600">{t("adminStatsFail")}</p>}
      </div>

      <h2 className="mt-10 text-lg font-medium">{t("adminLogs")}</h2>
      {!logs || logs.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">{t("noRecords")}</p>
      ) : (
        <ul className="mt-3 divide-y divide-line text-sm">
          {logs.map((l) => (
            <li key={l.id} className="flex flex-col gap-0.5 py-2 sm:flex-row sm:justify-between sm:gap-4">
              <span>
                {sel === "all" && <span className="mr-2 text-ball-800">{who[l.user_id] ?? l.user_id.slice(0, 8)}</span>}
                {ITEM[l.item] ? itemLabel(ITEM[l.item], locale) : l.item}
                {l.note && <span className="ml-2 text-slate-500">{l.note}</span>}
              </span>
              <span className="text-slate-500 sm:shrink-0">
                {[l.value != null ? String(l.value) : null, l.count != null ? `${l.count} ${t("times")}` : null].filter(Boolean).join(" · ")}
                <span className="ml-3">{new Date(l.created_at).toLocaleString(dateLocale(locale), { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
