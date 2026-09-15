"use client";

import { useLocale } from "@/hooks/useLocale"

const LANGS = [
    {code: "en" as const, label: "English"},
    {code: "si" as const, label: "\u0dc3\u0dd2\u0d82\u0dc4\u0dbd"},
    {code: "ta" as const, label: "\u0ba4\u0bae\u0bbf\u0bb4\u0bcd"},
];

export default function AppShell() {
    const {lang, setLang, t} = useLocale("en");

    return(
        <div style={{display: "flex", alignItems: "center", gap: 12, marginBottom: "2rem"}}>
            <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem', gap: 6}}>
                {LANGS.map(({ code, label }) => (
                    <button
                        key={code}
                        onClick={() => setLang(code)}
                        style={{
                            padding: "5px 12px",
                            borderRadius: "var(--radius)",
                            border: lang === code ? "1.5px solid var(--green)" : "0.5px solid var(--border-strong)",
                            background: lang === code ? "#E1F5EE" : "var(--surface-1)",
                            color: lang === code ? "var(--green)" : "var(--text-secondary)",
                            fontSize: 13, fontWeight: lang === code ? 500 : 400,
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "2rem" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className="ti ti-leaf" style={{ fontSize: 24, color: "var(--green)" }} />
                </div>
                <div>
                    <div style={{ fontSize: 22, fontWeight: 600 }}>{t("appName")}</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{t("tagline")}</div>
                </div>
            </div>
                
        </div>
    );

}

