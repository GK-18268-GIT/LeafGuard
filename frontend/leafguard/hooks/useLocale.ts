"use client";

import { useState, useCallback } from "react";
import en from "@/locales/en.json";
import si from "@/locales/si.json";
import ta from "@/locales/ta.json";

export type Locale = "en" | "si" | "ta";
const LOCALES: Record<Locale, Record<string, string>> = { en, si, ta };

export function useLocale(initial: Locale = "en") {
  const [lang, setLang] = useState<Locale>(initial);
  const t = useCallback(
    (key: string) => LOCALES[lang]?.[key] ?? LOCALES.en[key] ?? key,
    [lang]
  );
  return { lang, setLang, t };
}