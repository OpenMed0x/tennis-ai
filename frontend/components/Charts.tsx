"use client";
import {
  Bar, BarChart, CartesianGrid, ComposedChart, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { MODULES } from "@/lib/modules";
import { itemLabel } from "@/lib/i18n";
import type { Stats } from "@/lib/stats";
import { useLocale, useT } from "./LocaleProvider";

const ITEM = Object.fromEntries(MODULES.flatMap((m) => m.items.map((i) => [i.key, i])));
const GREEN = "#5B7300", SLATE = "#1E2A0A", AMBER = "#C9E21D", SKY = "#C9E21D";

function Kpi({ title, value, sub }: { title: string; value: string; sub?: string }) {
  return (
    <div className="rounded border border-line border-l-4 border-l-ball-500 p-4">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-1 text-xl font-semibold sm:text-2xl">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

function Box({ title, empty, emptyText, children }: { title: string; empty: boolean; emptyText: string; children: React.ReactNode }) {
  return (
    <section className="rounded border border-line p-4">
      <h3 className="mb-3 font-medium">{title}</h3>
      <div className="h-64">
        {empty ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">{emptyText}</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">{children as React.ReactElement}</ResponsiveContainer>
        )}
      </div>
    </section>
  );
}

export default function Charts({ stats }: { stats: Stats }) {
  const locale = useLocale();
  const t = useT();
  const tot = stats.totals;
  const short = (w: string) => w.slice(5); // 2026-10-19 → 10-19
  const h = (min: number) => (min / 60).toFixed(1);

  const hours = stats.weekly.map((w) => ({
    week: short(w.week),
    [t("lgTotal")]: +h(w.time_min),
    [t("lgSkill")]: +h(w.skill_minutes),
  }));
  let acc = 0;
  const money = stats.weekly.map((w) => ({ week: short(w.week), [t("lgWeek")]: w.money, [t("lgCum")]: (acc += w.money) }));
  const reps = stats.reps_by_item.map((r) => ({
    name: ITEM[r.item] ? itemLabel(ITEM[r.item], locale) : r.item,
    [t("lgReps")]: r.count,
  }));
  const results = stats.results.map((r) => ({
    week: short(r.week), [t("lgSkillRes")]: r.skill, [t("lgMind")]: r.mind, [t("lgOther")]: r.other,
  }));
  const none = t("noData");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi title={t("kpiReps")} value={`${tot.reps}`} sub={t("kpiRepsSub", { m: tot.mindful, r: tot.recover })} />
        <Kpi title={t("kpiTime")} value={`${h(tot.time_min)} ${t("hours")}`} sub={t("kpiTimeSub", { h: h(tot.skill_minutes) })} />
        <Kpi title={t("kpiMoney")} value={`${tot.money} ${locale === "en" ? "CNY" : "元"}`} />
        <Kpi title={t("kpiReturn")} value={tot.avg_rating != null ? `${tot.avg_rating} / 10` : "—"} sub={t("kpiReturnSub")} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Box title={t("chHours")} empty={hours.length === 0} emptyText={none}>
          <BarChart data={hours}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="week" fontSize={12} />
            <YAxis fontSize={12} width={36} />
            <Tooltip />
            <Legend />
            <Bar dataKey={t("lgTotal")} fill={GREEN} />
            <Bar dataKey={t("lgSkill")} fill={SKY} />
          </BarChart>
        </Box>

        <Box title={t("chMoney")} empty={money.length === 0} emptyText={none}>
          <ComposedChart data={money}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="week" fontSize={12} />
            <YAxis fontSize={12} width={44} />
            <Tooltip />
            <Legend />
            <Bar dataKey={t("lgWeek")} fill={AMBER} />
            <Line type="monotone" dataKey={t("lgCum")} stroke={SLATE} strokeWidth={2} dot={false} />
          </ComposedChart>
        </Box>

        <Box title={t("chReps")} empty={reps.length === 0} emptyText={none}>
          <BarChart data={reps} layout="vertical" margin={{ left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" fontSize={12} />
            <YAxis type="category" dataKey="name" fontSize={12} width={locale === "en" ? 130 : 80} />
            <Tooltip />
            <Bar dataKey={t("lgReps")} fill={GREEN} />
          </BarChart>
        </Box>

        <Box title={t("chResults")} empty={results.length === 0} emptyText={none}>
          <LineChart data={results}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="week" fontSize={12} />
            <YAxis domain={[0, 10]} fontSize={12} width={28} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={t("lgSkillRes")} stroke={GREEN} strokeWidth={2} connectNulls />
            <Line type="monotone" dataKey={t("lgMind")} stroke="#1E2A0A" strokeWidth={2} connectNulls />
            <Line type="monotone" dataKey={t("lgOther")} stroke="#8FA800" strokeWidth={2} connectNulls />
          </LineChart>
        </Box>
      </div>
    </div>
  );
}
