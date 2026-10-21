"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Item } from "@/lib/modules";
import { groupLabel, itemHint, itemLabel, unitLabel } from "@/lib/i18n";
import { useLocale, useT } from "./LocaleProvider";

const API = process.env.NEXT_PUBLIC_API_URL;

// 手机：44px 高的触控区、16px 字号（避免 iOS 聚焦时自动放大）；平板/电脑：更紧凑
const inp = "h-11 min-w-0 rounded border border-slate-300 px-2 text-base md:h-9 md:text-sm";
const btnPrimary = "h-11 rounded bg-ball-500 px-4 text-sm text-ink disabled:opacity-40 md:h-9 md:px-3";
const btnOutline =
  "h-11 w-full rounded border border-ball-700 px-4 text-sm text-ball-800 hover:bg-ball-100 disabled:opacity-50 sm:w-auto md:h-9 md:px-3";

export default function LogForm({ module, items, readOnly = false }: { module: string; items: Item[]; readOnly?: boolean }) {
  const router = useRouter();
  const locale = useLocale();
  const t = useT();
  const [vals, setVals] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function save(item: Item, value: number | null, note: string | null, count: number | null = null) {
    setBusy(item.key);
    setErr(null);
    const {
      data: { session },
    } = await createClient().auth.getSession();
    const r = await fetch(`${API}/api/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ module, item: item.key, value, note, count }),
    });
    setBusy(null);
    if (!r.ok) {
      setErr(`${t("saveFail")} (${r.status}). ${t("saveFailHint")}`);
      return;
    }
    setVals((v) => ({
      ...v,
      [item.key]: "", [`${item.key}__min`]: "", [`${item.key}__cnt`]: "", [`${item.key}__txt`]: "", [`${item.key}__sc`]: "",
    }));
    router.refresh();
  }

  let lastGroup: string | undefined;
  return (
    <div>
      {err && <p className="mb-3 text-sm text-red-600">{err}</p>}
      <fieldset disabled={readOnly} className={readOnly ? "min-w-0 opacity-60" : "min-w-0"}>
        <ul className="divide-y divide-line rounded border border-line">
          {items.map((item) => {
            const showGroup = item.group && item.group !== lastGroup;
            lastGroup = item.group;
            const label = itemLabel(item, locale);
            const hint = itemHint(item, locale);
            const unit = unitLabel(item.unit, locale);
            const v = vals[item.key] ?? "";
            const disabled = busy === item.key;
            const mk = `${item.key}__min`, ck = `${item.key}__cnt`, tk = `${item.key}__txt`, sk = `${item.key}__sc`;
            const mv = vals[mk] ?? "", cv = vals[ck] ?? "", tv = vals[tk] ?? "", sv = vals[sk] ?? "";
            return (
              <li key={item.key}>
                {showGroup && <div className="bg-ball-50 px-4 py-1.5 text-sm font-medium text-slate-600">{groupLabel(item.group!, locale)}</div>}
                <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-3">
                  <div className="min-w-0 flex-1">
                    <div>{label}</div>
                    {hint && <div className="text-xs text-slate-500">{hint}</div>}
                  </div>

                  {(item.kind === "check" || item.kind === "count") && (
                    <button disabled={disabled} onClick={() => save(item, 1, null)} className={btnOutline}>
                      {item.kind === "check" ? t("done") : `+1 ${unit}`}
                    </button>
                  )}

                  {item.kind === "number" && (
                    <form className="flex w-full items-center gap-2 sm:w-auto"
                      onSubmit={(e) => { e.preventDefault(); if (v !== "") save(item, Number(v), null); }}>
                      <input type="number" inputMode="decimal" step="any" value={v} aria-label={label}
                        onChange={(e) => setVals({ ...vals, [item.key]: e.target.value })}
                        className={`${inp} flex-1 sm:w-24 sm:flex-none`} />
                      <span className="text-sm text-slate-500">{unit}</span>
                      <button disabled={disabled || v === ""} className={btnPrimary}>{t("log")}</button>
                    </form>
                  )}

                  {item.kind === "time_count" && (
                    <form className="flex w-full flex-wrap items-center gap-2 sm:w-auto"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (mv === "" && cv === "") return;
                        save(item, mv !== "" ? Number(mv) : null, null, cv !== "" ? Number(cv) : null);
                      }}>
                      <input type="number" inputMode="decimal" step="any" min="0" value={mv} aria-label={`${label} ${t("minutes")}`}
                        onChange={(e) => setVals({ ...vals, [mk]: e.target.value })}
                        className={`${inp} flex-1 sm:w-20 sm:flex-none`} />
                      <span className="text-sm text-slate-500">{t("minutes")}</span>
                      <input type="number" inputMode="numeric" step="1" min="0" value={cv} aria-label={`${label} ${t("times")}`}
                        onChange={(e) => setVals({ ...vals, [ck]: e.target.value })}
                        className={`${inp} flex-1 sm:w-20 sm:flex-none`} />
                      <span className="text-sm text-slate-500">{t("times")}</span>
                      <button disabled={disabled || (mv === "" && cv === "")} className={`${btnPrimary} w-full sm:w-auto`}>{t("log")}</button>
                    </form>
                  )}

                  {item.kind === "text_score" && (
                    <form className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:max-w-md"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (sv === "") return;
                        save(item, Math.min(10, Math.max(1, Number(sv))), tv.trim() || null);
                      }}>
                      <input type="number" inputMode="numeric" min="1" max="10" step="1" value={sv} aria-label={`${label} ${t("scoreAria")}`}
                        onChange={(e) => setVals({ ...vals, [sk]: e.target.value })}
                        className={`${inp} w-20`} />
                      <span className="text-sm text-slate-500">/ 10</span>
                      <input value={tv} placeholder={t("oneLine")} aria-label={`${label} ${t("noteAria")}`}
                        onChange={(e) => setVals({ ...vals, [tk]: e.target.value })}
                        className={`${inp} min-w-0 flex-1 sm:w-48`} />
                      <button disabled={disabled || sv === ""} className={`${btnPrimary} w-full sm:w-auto`}>{t("log")}</button>
                    </form>
                  )}

                  {item.kind === "text" && (
                    <form className="flex w-full gap-2 sm:w-80 lg:w-96"
                      onSubmit={(e) => { e.preventDefault(); if (v.trim()) save(item, null, v.trim()); }}>
                      <input value={v} aria-label={label}
                        onChange={(e) => setVals({ ...vals, [item.key]: e.target.value })}
                        className={`${inp} flex-1`} />
                      <button disabled={disabled || !v.trim()} className={btnPrimary}>{t("log")}</button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </fieldset>
    </div>
  );
}
