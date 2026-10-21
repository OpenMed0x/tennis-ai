import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MODULES } from "@/lib/modules";
import { getT } from "@/lib/locale-server";
import { dateLocale, itemLabel, modDesc, modTitle, unitLabel } from "@/lib/i18n";
import LogForm from "@/components/LogForm";

type Log = { id: number; item: string; value: number | null; count: number | null; note: string | null; created_at: string };

async function api(path: string, token?: string) {
  const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return r.ok ? r.json() : null;
}

export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module: slug } = await params;
  const mod = MODULES.find((m) => m.slug === slug);
  if (!mod) notFound();
  const { locale, t } = await getT();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let token: string | undefined;
  if (user) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    token = session?.access_token;
  }

  // 未登录：不请求后端，直接给空数据（字段仍完整展示）
  const logs: Log[] | null = user ? await api(`/api/logs?module=${slug}&days=14`, token) : [];
  const totals = slug === "summary" ? (user ? await api("/api/summary", token) : { time_min: 0, money: 0 }) : null;
  const byKey = Object.fromEntries(mod.items.map((i) => [i.key, i]));

  const valueText = (l: Log) => {
    const it = byKey[l.item];
    const u = unitLabel(it?.unit, locale);
    if (it?.kind === "check") return "✓";
    if (it?.kind === "time_count")
      return [l.value != null && `${l.value} ${t("minutes")}`, l.count != null && `${l.count} ${t("times")}`].filter(Boolean).join(" · ");
    if (it?.kind === "count") return `+${l.value} ${u}`;
    return l.value != null ? `${l.value} ${u}` : "";
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-8 sm:py-10">
      <h1 className="text-2xl font-semibold">{modTitle(mod, locale)}</h1>
      <p className="mt-1 text-slate-600">{modDesc(mod, locale)}</p>

      {!user && (
        <div className="mt-5 flex flex-col gap-3 rounded border border-ball-300 bg-ball-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-700">{t("guestBanner")}</p>
          <Link href={`/login?next=/${slug}`} className="flex h-11 shrink-0 items-center justify-center rounded bg-ball-500 px-4 text-sm text-ink md:h-9">
            {t("signIn")}
          </Link>
        </div>
      )}

      {totals && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded border border-line p-4">
            <div className="text-sm text-slate-500">{t("totalTime")}</div>
            <div className="text-xl font-semibold">{(totals.time_min / 60).toFixed(1)} {t("hours")}</div>
          </div>
          <div className="rounded border border-line p-4">
            <div className="text-sm text-slate-500">{t("totalMoney")}</div>
            <div className="text-xl font-semibold">{totals.money} {unitLabel("元", locale)}</div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <LogForm module={slug} items={mod.items} readOnly={!user} />
      </div>

      <h2 className="mt-10 text-lg font-medium">{t("last14")}</h2>
      {!logs ? (
        <p className="mt-2 text-sm text-red-600">{t("loadFail")}</p>
      ) : logs.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">{user ? t("emptyUser") : t("emptyGuest")}</p>
      ) : (
        <ul className="mt-3 divide-y divide-line text-sm">
          {logs.map((l) => {
            const it = byKey[l.item];
            return (
              <li key={l.id} className="flex flex-col gap-0.5 py-2 sm:flex-row sm:justify-between sm:gap-4">
                <span>
                  {it ? itemLabel(it, locale) : l.item}
                  {l.note && <span className="ml-2 text-slate-500">{l.note}</span>}
                </span>
                <span className="text-slate-500 sm:shrink-0">
                  {valueText(l)}
                  <span className="ml-3">{new Date(l.created_at).toLocaleString(dateLocale(locale), { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
