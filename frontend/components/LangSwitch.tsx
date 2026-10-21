"use client";
import { useRouter } from "next/navigation";
import { useLocale } from "./LocaleProvider";
import { LOCALE_COOKIE } from "@/lib/i18n";

// 一键切换：写入 cookie，然后让服务端重新渲染当前页面
export default function LangSwitch() {
  const router = useRouter();
  const locale = useLocale();
  const next = locale === "zh" ? "en" : "zh";
  return (
    <button
      aria-label={next === "en" ? "Switch to English" : "切换到中文"}
      onClick={() => {
        document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
        router.refresh();
      }}
      className="flex h-9 min-w-11 items-center justify-center rounded border border-ink/25 bg-white/70 px-2 text-sm text-ink hover:bg-white"
    >
      {next === "en" ? "EN" : "中文"}
    </button>
  );
}
