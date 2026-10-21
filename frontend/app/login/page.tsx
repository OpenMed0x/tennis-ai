"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/components/LocaleProvider";

const COUNTRY_CODES = ["+86", "+1", "+852", "+886", "+81", "+44"];
const input = "h-11 w-full rounded border border-slate-300 px-3 text-base";
const primary = "h-11 w-full rounded bg-ball-500 px-3 text-ink hover:bg-ball-600 disabled:opacity-50";

export default function LoginPage() {
  const router = useRouter();
  const t = useT();
  const [tab, setTab] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [cc, setCc] = useState("+86");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [cool, setCool] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cool <= 0) return;
    const id = setTimeout(() => setCool((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cool]);

  const target = tab === "email" ? email.trim() : `${cc}${phone.replace(/\D/g, "")}`;
  const ready = tab === "email" ? email.trim().length > 3 : phone.replace(/\D/g, "").length >= 5;

  function reset(next: "email" | "phone") {
    setTab(next);
    setSent(false);
    setCode("");
    setMsg(null);
  }

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    if (!ready || cool > 0) return;
    setLoading(true);
    setMsg(null);
    const supabase = createClient();
    // 首次使用的邮箱 / 手机号会自动注册，所以登录和注册是同一个流程
    const { error } =
      tab === "email"
        ? await supabase.auth.signInWithOtp({ email: target, options: { shouldCreateUser: true } })
        : await supabase.auth.signInWithOtp({ phone: target });
    setLoading(false);
    if (error) return setMsg(error.message);
    setSent(true);
    setCode("");
    setCool(60);
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const supabase = createClient();
    const token = code.trim();
    const { error } =
      tab === "email"
        ? await supabase.auth.verifyOtp({ email: target, token, type: "email" })
        : await supabase.auth.verifyOtp({ phone: target, token, type: "sms" });
    setLoading(false);
    if (error) return setMsg(error.message);
    // 登录后回到刚才的页面，只允许站内路径
    const raw = new URLSearchParams(window.location.search).get("next");
    const next = raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/nutrition";
    router.push(next);
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-10 sm:py-16">
      <h1 className="text-2xl font-semibold">{t("loginTitle")}</h1>
      <p className="mt-2 text-sm text-slate-600">{t("loginSub")}</p>

      <div className="mt-6 grid grid-cols-2 gap-1 rounded bg-ball-100 p-1" role="tablist">
        {(["email", "phone"] as const).map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => reset(k)}
            className={`h-10 rounded text-sm ${tab === k ? "bg-white font-semibold shadow-sm" : "text-slate-600"}`}
          >
            {t(k === "email" ? "tabEmail" : "tabPhone")}
          </button>
        ))}
      </div>

      {!sent ? (
        <form onSubmit={send} className="mt-5 space-y-4">
          {tab === "email" ? (
            <input type="email" inputMode="email" autoComplete="email" required placeholder={t("emailPh")}
              value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
          ) : (
            <div className="flex gap-2">
              <select value={cc} onChange={(e) => setCc(e.target.value)} aria-label="Country code"
                className="h-11 w-24 shrink-0 rounded border border-slate-300 bg-white px-2 text-base">
                {COUNTRY_CODES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="tel" inputMode="tel" autoComplete="tel-national" required placeholder={t("phonePh")}
                value={phone} onChange={(e) => setPhone(e.target.value)} className={input} />
            </div>
          )}
          {msg && <p className="text-sm text-red-600">{msg}</p>}
          <button disabled={loading || !ready} className={primary}>{loading ? t("wait") : t("sendCode")}</button>
        </form>
      ) : (
        <form onSubmit={verify} className="mt-5 space-y-4">
          <p className="text-sm text-slate-600">{t("codeSent", { to: target })}</p>
          <input inputMode="numeric" autoComplete="one-time-code" required maxLength={8} placeholder={t("codePh")}
            value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className={`${input} text-center tracking-widest`} />
          {msg && <p className="text-sm text-red-600">{msg}</p>}
          <button disabled={loading || code.length < 6} className={primary}>{loading ? t("wait") : t("verify")}</button>
          <div className="flex items-center justify-between text-sm">
            <button type="button" onClick={() => send()} disabled={cool > 0 || loading}
              className="text-ball-800 disabled:text-slate-400">
              {cool > 0 ? t("resendIn", { s: cool }) : t("resend")}
            </button>
            <button type="button" onClick={() => { setSent(false); setMsg(null); }} className="text-slate-600 underline">
              {t("change")}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
