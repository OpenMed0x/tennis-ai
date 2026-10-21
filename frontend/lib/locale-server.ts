import { cookies } from "next/headers";
import { LOCALE_COOKIE, makeT, type Locale } from "./i18n";

export async function getLocale(): Promise<Locale> {
  const v = (await cookies()).get(LOCALE_COOKIE)?.value;
  return v === "en" ? "en" : "zh"; // 默认中文
}

export async function getT() {
  const locale = await getLocale();
  return { locale, t: makeT(locale) };
}
