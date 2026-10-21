import Link from "next/link";
import { MODULES } from "@/lib/modules";
import { getT } from "@/lib/locale-server";
import { modDesc, modTitle } from "@/lib/i18n";

export default async function Home() {
  const { locale, t } = await getT();
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
      <h1 className="text-2xl font-semibold sm:text-3xl">{t("homeTitle")}</h1>
      <p className="mt-3 text-slate-600">{t("homeSub")}</p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m) => (
          <li key={m.slug}>
            <Link href={`/${m.slug}`} className="block rounded border border-line p-4 hover:border-ball-700">
              <div className="font-medium">{modTitle(m, locale)}</div>
              <div className="text-sm text-slate-500">{modDesc(m, locale)}</div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
