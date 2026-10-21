import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/locale-server";
import { EMPTY_STATS, type Stats } from "@/lib/stats";
import Charts from "@/components/Charts";

export default async function DashboardPage() {
  const { t } = await getT();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let stats: Stats | null = EMPTY_STATS; // 未登录：空白预览
  if (user) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stats`, {
      headers: { Authorization: `Bearer ${session?.access_token}` },
      cache: "no-store",
    });
    stats = r.ok ? await r.json() : null;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
      <h1 className="text-2xl font-semibold">{t("dashTitle")}</h1>
      <p className="mt-1 text-slate-600">{t("dashSub")}</p>

      {!user && (
        <div className="mt-5 flex flex-col gap-3 rounded border border-ball-300 bg-ball-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-700">{t("guestBannerDash")}</p>
          <Link href="/login?next=/dashboard" className="flex h-11 shrink-0 items-center justify-center rounded bg-ball-500 px-4 text-sm text-ink md:h-9">
            {t("signIn")}
          </Link>
        </div>
      )}

      <div className="mt-6">
        {stats ? <Charts stats={stats} /> : <p className="text-sm text-red-600">{t("statsFail")}</p>}
      </div>
    </main>
  );
}
