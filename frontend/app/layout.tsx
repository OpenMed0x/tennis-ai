import "./globals.css";
import Link from "next/link";
import type { Metadata, Viewport } from "next";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";
import LangSwitch from "@/components/LangSwitch";
import NavLinks, { type NavItem } from "@/components/NavLinks";
import { LocaleProvider } from "@/components/LocaleProvider";
import { getT } from "@/lib/locale-server";
import { modTitle } from "@/lib/i18n";
import { MODULES } from "@/lib/modules";

export const metadata: Metadata = { title: "Tennis" };
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = await getT();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = user?.app_metadata?.role === "admin";

  // group 相同的排在一起，换组时左边栏画一条分隔线
  const links: NavItem[] = [
    ...MODULES.map((m) => ({ href: `/${m.slug}`, label: modTitle(m, locale), group: 0 })),
    { href: "/dashboard", label: t("navDashboard"), group: 1 },
    ...(isAdmin ? [{ href: "/admin", label: t("navAdmin"), group: 2 }] : []),
  ];

  const brand = (
    <Link href="/" className="flex items-center gap-2.5">
      <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-xl">🎾</span>
      <span className="leading-tight">
        <span className="block text-lg font-bold">Tennis</span>
        <span className="block text-xs text-ink/70">{t("tagline")}</span>
      </span>
    </Link>
  );
  const signIn = (
    <Link href="/login" className="whitespace-nowrap rounded bg-white px-3 py-2 text-sm font-medium text-ink hover:bg-white/80">
      {t("signIn")}
    </Link>
  );

  return (
    <html lang={locale === "zh" ? "zh-CN" : "en"}>
      <body className="min-h-dvh bg-white pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] text-ink">
        <LocaleProvider locale={locale}>
          <div className="md:flex">
            {/* 平板 / 电脑：左边栏 */}
            <aside className="hidden border-r border-gray-200 bg-white px-3 py-5 md:sticky md:top-0 md:flex md:h-dvh md:w-56 md:shrink-0 md:flex-col lg:w-64">
              <div className="px-2">{brand}</div>
              <nav aria-label="Sections" className="mt-6 flex-1 overflow-y-auto">
                <NavLinks links={links} variant="side" />
              </nav>
              <div className="mt-4 space-y-2 border-t border-ink/15 pt-4">
                <div className="flex items-center justify-between gap-2">
                  <LangSwitch />
                  {user ? <SignOutButton /> : signIn}
                </div>
                {user && <div className="truncate px-1 text-xs text-ink/70">{user.email ?? user.phone}</div>}
              </div>
            </aside>

            <div className="min-w-0 flex-1">
              {/* 手机：顶部栏，栏目放第二行可左右滑动 */}
              <header className="sticky top-0 z-10 bg-ball-500 pt-[env(safe-area-inset-top)] md:hidden">
                <div className="flex items-center justify-between gap-3 px-4 py-2">
                  {brand}
                  <div className="flex items-center gap-1">
                    <LangSwitch />
                    {user ? <SignOutButton /> : signIn}
                  </div>
                </div>
                <nav aria-label="Sections" className="flex gap-2 overflow-x-auto px-4 pb-2">
                  <NavLinks links={links} variant="pills" />
                </nav>
              </header>
              {children}
            </div>
          </div>
        </LocaleProvider>
      </body>
    </html>
  );
}
