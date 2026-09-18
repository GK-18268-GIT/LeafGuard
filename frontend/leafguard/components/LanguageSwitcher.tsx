"use client";
import { Locale } from "@/hooks/useLocale";

interface Props {
    lang: Locale;
    setLang: (l: Locale) => void;
}

const LANGS: {code: Locale; label: string; native: string }[] = [
    {code: "en" as const, label: "English", native: "EN" },
    {code: "si" as const, label: "Sinhala", native: "සිං" },
    {code: "ta" as const, label: "Tamil", native: "தமிழ்" },
];

export default function LanguageSwitcher({ lang, setLang}: Props) {
    return (
        <div style={{ display: "flex", gap: 4}}>
            {LANGS.map(({ code, label, native }) => {
                const active = lang === code;
                return (
                    <button
                        key={code}
                        onClick={() => setLang(code)}
                        title={label}
                        aria-label={`Swich to ${label}`}
                        aria-pressed={active}
                        style={{
                            padding: "5px 11px",
                            borderRadius: "var(--radius)",
                            border: active ? "1.5px solid var(--green)": "0.5px solid var(--border-strong)",
                            background: active ? "#E1F5EE" : "var(--surface-1)",
                            color: active ? "var(--green)" : "var(--text-secondary)",
                            fontSize: 13,
                            fontWeight: active ? 600 : 400,
                            cursor: "pointer",
                            transition: "all 0.15s"
                        }}>
                            {native}
                        </button>
                )
            })}
        </div>
    )
}