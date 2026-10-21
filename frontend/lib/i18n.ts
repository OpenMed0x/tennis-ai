import type { Item, Module } from "./modules";

export type Locale = "zh" | "en";
export const LOCALE_COOKIE = "lang";

// 界面文字：[中文, English]
const T = {
  tagline: ["系统·复盘·可视化", "System · Review · Visualize"],
  navDashboard: ["数据看板", "Dashboard"],
  navAdmin: ["管理员", "Admin"],
  signIn: ["登录 / 注册", "Sign in"],
  signOut: ["退出登录", "Sign out"],
  homeTitle: ["网球训练记录", "Tennis Training Log"],
  homeSub: ["从膳食到心理，每次训练的准备、练习和复盘都记在这里。", "From nutrition to mindset: log your prep, practice and review for every session."],
  guestBanner: ["这是空白预览。登录后可以记录你自己的训练数据，每个人只能看到自己的记录。", "This is an empty preview. Sign in to log your own training. Everyone only sees their own records."],
  guestBannerDash: ["这是空白预览。登录后显示你自己的数据，每个人只能看到自己的记录。", "This is an empty preview. Sign in to see your own data. Everyone only sees their own records."],
  last14: ["最近 14 天", "Last 14 days"],
  emptyUser: ["还没有记录，在上面添加第一条。", "No records yet. Add your first one above."],
  emptyGuest: ["登录后，你的记录会显示在这里。", "Sign in and your records will show up here."],
  loadFail: ["读取记录失败，请确认 Python 服务已启动。", "Couldn't load records. Make sure the Python service is running."],
  totalTime: ["累计时间", "Total time"],
  totalMoney: ["累计金钱", "Total spend"],
  hours: ["小时", "h"],
  done: ["完成", "Done"],
  log: ["记录", "Log"],
  minutes: ["分钟", "min"],
  times: ["次", "times"],
  oneLine: ["一句话（可选）", "One line (optional)"],
  saveFail: ["保存失败", "Save failed"],
  saveFailHint: ["请确认后端已启动并已登录。", "Make sure the backend is running and you're signed in."],
  scoreAria: ["评分", "score"],
  noteAria: ["说明", "note"],
  dashTitle: ["数据看板", "Dashboard"],
  dashSub: ["累计次数、投入时长、投入资金、收益回报", "Total reps, time invested, money invested, return"],
  statsFail: ["读取统计失败，请确认 Python 服务已启动。", "Couldn't load stats. Make sure the Python service is running."],
  kpiReps: ["累计次数", "Total reps"],
  kpiRepsSub: ["技能练习次数；正念 {m} 次 · 切换恢复 {r} 次", "Skill reps; mindfulness {m} · resets {r}"],
  kpiTime: ["投入时长", "Time invested"],
  kpiTimeSub: ["其中技能练习 {h} 小时", "of which skill practice {h} h"],
  kpiMoney: ["投入资金", "Money invested"],
  kpiReturn: ["收益回报", "Return"],
  kpiReturnSub: ["运动总结里结果自评的均分", "Average self-rating of results in Summary"],
  chHours: ["每周投入时长（小时）", "Weekly time invested (hours)"],
  chMoney: ["投入资金（元）", "Money invested (CNY)"],
  chReps: ["各项技术累计次数", "Total reps by skill"],
  chResults: ["收益回报：结果自评趋势（每周均分）", "Return: self-rated results (weekly average)"],
  noData: ["暂无数据", "No data yet"],
  lgTotal: ["总训练", "Total training"],
  lgSkill: ["技能练习", "Skill practice"],
  lgWeek: ["当周", "This week"],
  lgCum: ["累计", "Cumulative"],
  lgSkillRes: ["技能", "Skills"],
  lgMind: ["心理", "Mindset"],
  lgOther: ["其他", "Other"],
  lgReps: ["次数", "Reps"],
  adminTitle: ["管理员", "Admin"],
  adminSub: ["只读：可以查看所有人的训练记录，不能修改", "Read-only: view everyone's training records, no editing"],
  allUsers: ["全部用户", "All users"],
  adminLogs: ["最近 14 天记录", "Records, last 14 days"],
  noRecords: ["暂无记录。", "No records."],
  adminStatsFail: ["读取统计失败。", "Couldn't load stats."],
  loginTitle: ["登录 / 注册", "Sign in / Sign up"],
  loginSub: ["输入邮箱或手机号，用验证码登录。首次使用会自动注册。", "Enter your email or phone number and sign in with a verification code. New here? We'll create your account automatically."],
  tabEmail: ["邮箱", "Email"],
  tabPhone: ["手机", "Phone"],
  emailPh: ["邮箱地址", "Email address"],
  phonePh: ["手机号", "Phone number"],
  sendCode: ["发送验证码", "Send code"],
  resendIn: ["{s} 秒后可重发", "Resend in {s}s"],
  resend: ["重新发送", "Resend code"],
  codePh: ["验证码", "Verification code"],
  verify: ["登录", "Sign in"],
  codeSent: ["验证码已发送到 {to}，请输入。", "Code sent to {to}. Enter it below."],
  change: ["换一个", "Use a different one"],
  wait: ["请稍候…", "Please wait…"],
} as const;

export type Key = keyof typeof T;

export function makeT(l: Locale) {
  return (k: Key, v?: Record<string, string | number>): string => {
    let s: string = T[k][l === "zh" ? 0 : 1];
    if (v) for (const [a, b] of Object.entries(v)) s = s.replace(`{${a}}`, String(b));
    return s;
  };
}

export const dateLocale = (l: Locale) => (l === "en" ? "en-US" : "zh-CN");

// ---- 板块 / 记录项的英文名（中文原文在 lib/modules.ts） ----
const EN_MODULE: Record<string, { title: string; desc: string }> = {
  nutrition: { title: "Nutrition", desc: "Meals, hydration, weight" },
  prep: { title: "Preparation", desc: "Gear and warm-up" },
  skills: { title: "Tennis Skills", desc: "Practice time and reps per skill" },
  mind: { title: "Mindset", desc: "Stress, resetting, mindfulness" },
  summary: { title: "Summary", desc: "Costs and results" },
};
const EN_ITEM: Record<string, { label: string; hint?: string }> = {
  eat_full: { label: "Ate enough" },
  water: { label: "Iced water", hint: "Goal: 1.5 L" },
  weight: { label: "Body weight" },
  wristband: { label: "Wristband" },
  hat: { label: "Hat" },
  clothes_shoes: { label: "Sportswear / shoes" },
  warm_wrist: { label: "Wrist warm-up" },
  warm_band: { label: "Resistance band training" },
  warm_legs: { label: "Leg footwork drills" },
  steady_rally: { label: "Steady rallying" },
  forehand: { label: "Forehand" },
  two_hand_bh: { label: "Two-handed backhand" },
  one_hand_bh: { label: "One-handed backhand" },
  serve: { label: "Serve" },
  volley: { label: "Volley" },
  slice: { label: "Slice" },
  find_point: { label: "Finding the contact point" },
  swing_volley: { label: "Swing volley" },
  juggle: { label: "Ball juggling" },
  eye_on_ball: { label: "Watching the ball" },
  stress: { label: "Stress check", hint: "1 = calm, 10 = tense" },
  recover: { label: "Resetting between good and bad shots", hint: "You don't need to be at your best all the time. Getting back is enough." },
  mindful: { label: "“Great, I just completed another shot”" },
  time_min: { label: "Time invested" },
  money: { label: "Money invested" },
  result_skill: { label: "Skills" },
  result_mind: { label: "Mindset" },
  result_other: { label: "Other" },
};
const EN_GROUP: Record<string, string> = {
  装备: "Gear",
  热身: "Warm-up",
  成本: "Costs",
  "结果（自评 1–10 分，可附一句话）": "Results (self-rate 1–10, optional note)",
};
const EN_UNIT: Record<string, string> = { 升: "L", 公斤: "kg", 分钟: "min", 次: "times", 元: "CNY", "/ 10": "/ 10" };

export const modTitle = (m: Module, l: Locale) => (l === "en" ? EN_MODULE[m.slug]?.title : undefined) ?? m.title;
export const modDesc = (m: Module, l: Locale) => (l === "en" ? EN_MODULE[m.slug]?.desc : undefined) ?? m.desc;
export const itemLabel = (i: Item, l: Locale) => (l === "en" ? EN_ITEM[i.key]?.label : undefined) ?? i.label;
export const itemHint = (i: Item, l: Locale) => (l === "en" ? EN_ITEM[i.key]?.hint : undefined) ?? i.hint;
export const groupLabel = (g: string, l: Locale) => (l === "en" ? EN_GROUP[g] : undefined) ?? g;
export const unitLabel = (u: string | undefined, l: Locale) => (u && l === "en" ? EN_UNIT[u] : undefined) ?? u ?? "";
