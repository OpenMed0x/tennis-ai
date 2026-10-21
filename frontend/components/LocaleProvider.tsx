"use client";
import { createContext, useContext } from "react";
import { makeT, type Locale } from "@/lib/i18n";

const Ctx = createContext<Locale>("zh");

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <Ctx.Provider value={locale}>{children}</Ctx.Provider>;
}
export const useLocale = () => useContext(Ctx);
export function useT() {
  return makeT(useLocale());
}
