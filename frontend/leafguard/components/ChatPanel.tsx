"use client";
import { useState, useRef, useEffect } from "react";
import { sendChat, ChatMessage } from "@/libs/api"; 
import { Locale } from "@/hooks/useLocale";

interface Props {
    disease: string;
    severity: string;
    lang: Locale;
    t: (key: string) => string;
    modelType: "plant" | "rice";
}

const ACCENT = { plant: "#1D9E75", rice: "#378ADD" }

export default function ChatPanel({ disease, severity, lang, t, modelType }: Props) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const accent = ACCENT[modelType];

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    async function handleSend() {
        if(!input.trim() || loading) return;
        const useMsg: ChatMessage = { role: "user", content: input.trim() };
        const next = [...messages, useMsg];
        setMessages(next);
        setInput("");
        setLoading(true);

        try {
            const reply = await sendChat(next, disease, severity, lang);
            setMessages([...next, { role: "assistant", content: reply }]);
        } catch {
            setMessages([...next, { role: "assistant", content: "Connection error. Please try again"}]);
        }
        setLoading(false);
    }

    return (
        <div style={{
            background: "var(--surface-2)",
            border: "0.5px solid var(--border)",
            borderRadius: 12,
            overflow: "hidden",
        }}>
            <div style={{
                padding: "0.75rem 1rem",
                borderBottom: "0.5px solid var(--border)",
                display: "flex", alignItems: "center", gap: 8,
            }}>
                <i className="ti ti-robot" style={{ fontSize: 16, color: accent }} aria-hidden="true" />
                <span style={{
                    fontSize: 13, fontWeight: 600, color: "var(--text-primary)"
                }}>
                    {t("askAgronomist")}
                </span>
            </div>

            <div style={{
                minHeight: 180, maxHeight: 300, overflow: "auto", padding: "0.75rem 1rem"
            }}>
                {messages.length === 0 && (
                    <div style={{
                        color: "var(--text-muted)", fontSize: 13, alignItems: "center", padding: "2rem 0"
                    }}>
                        {t("chatIntro")}
                    </div>
                )}
                {messages.map((m, i) => (
                    <div
                        key={i}
                        style={{
                            marginBottom: 10,
                            display: "flex",
                            justifyContent: m.role === "user" ? "flex-end": "flex-start"
                        }}
                    >
                        <div style={{
                            maxWidth: "85%",
                            padding: "8px 12px",
                            borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 12px",
                            background: m.role === "user" ? accent : "var(--surface-1)",
                            color: m.role === "user" ? "#fff" : "var(--text-primary)",
                            fontSize: 13,
                            lineHeight: 1.65,
                            border: m.role === "user" ? "none" : "0.5px solid var(--border)"
                        }}
                        >
                            {m.content}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div style={{
                        display: "flex", gap: 4, padding: "4px 0"
                    }}>
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                style={{
                                    width: 6, height: 6, borderRadius: "50%",
                                    background: "var(--text-muted)",
                                    animation: `bounce 1s ${i * 0.2}s infinite`,
                                }}
                            />
                        ))}
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            <div style={{
                padding: "0.75rem 1rem",
                borderTop: "0.5px solid var(--border)",
                display: "flex", gap: 8
            }}>
            <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={t("chatPlaceholder")}
                aria-label={t("chatPlaceholder")}
                style={{
                    flex: 1, fontSize: 13,
                    padding: "8px 10px",
                    borderRadius: "var(--radius)",
                    border: "0.5px solid var(--border-strong)",
                    background: "var(--surface-1)",
                    color: "var(--text-primary)",
                    outline: "none"
                }}
            />

            <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                aria-label={t("send")}
                style={{
                    padding: "8px 14px",
                    borderRadius: "var(--radius)",
                    background: input.trim() && !loading ? accent : "var(--border)",
                    color: input.trim() && !loading ? "#fff" : "var(--text-muted)",
                    border: "none",
                    cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                    fontSize: 14,
                    transition: "background 0.15s",
                }}
            >
                <i className="ti ti-send" aria-hidden="true" />
            </button>
            </div>
        </div>
    );

}