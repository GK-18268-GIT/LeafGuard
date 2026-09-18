"use client";

import { useState } from "react";
import { Suggestions } from "@/libs/api";

interface Props {
    suggestions: Suggestions;
    t: (key: string) => string;
    modelType: "plant" | "rice";
}

const TABS = [
  { id: "agronomic",   icon: "ti-tool",        tKey: "techniques"   },
  { id: "fertilizers", icon: "ti-droplet",      tKey: "fertilizers"  },
  { id: "planting",    icon: "ti-seeding",      tKey: "plantingTips" },
];

//const ACCENT = { plant: "#1D9E75", rice: "#378ADD" };
const TAB_COLORS: Record<string, string> = {
  agronomic:   "#1D9E75",
  fertilizers: "#378ADD",
  planting:    "#BA7517",
};

export default function SuggestionsPanel({ suggestions, t }: Props) {
    const [activeTab, setActiveTab] = useState("agronomic");
    //const accent = ACCENT[modelType]

    return (
        <div className="fade-in">
            <div
                style={{
                    display: "flex", gap: 3,
                    background: "var(--surface-1)",
                    borderRadius: "var(--radius)",
                    padding: 3, marginBottom: 10
                }}
            >
                {TABS.map(({ id, icon, tKey}) => {
                    const active = activeTab === id;
                    return (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            style={{
                               flex: 1, padding: "7px 4px",
                               borderRadius: 6, border: "none",
                               background: active ? "var(--surface-2)" : "transparent",
                               color: active ? TAB_COLORS[id] : "var(--text-secondary)",
                               fontSize: 11, fontWeight: active ? 600 : 400,
                               cursor: "pointer",
                               display: "flex", flexDirection: "column",
                               alignItems: "center", gap: 3,
                               boxShadow: active ? "0 0 0 0.5px var(--border)" : "none", 
                            }}
                        >
                            < i className={`ti ${icon}`} style={{ fontSize: 15 }} aria-hidden="true" />
                            {t(tKey)}
                        </button>
                    );
                })}
            </div>

            {activeTab === "agronomic" && (
                <div style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: 12, padding: "1rem 1.25rem" }}>
                    <SectionHeader icon="ti-tool" title={t("techniques")} color={TAB_COLORS.agronomic} />
                    {suggestions.agronomicTechniques.map((item, i) => (
                        <div key={i} style={{ display: "flex", gap: 10,
                            marginBottom: i < 2 ? 14 : 0
                         }}>
                            <div style={{
                                width: 22, height: 22, borderRadius: 6,
                                flexShrink: 0,
                                background: "#EAF3DE", display: "flex",
                                alignItems: "center",
                                justifyContent: "center", fontSize: 11,
                                fontWeight: 600, color: "#3B6D11"
                            }}>
                                {i + 1}
                            </div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>
                                    {item.title}
                                </div>
                                <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                                    {item.detail}
                                </div>
                            </div>
                         </div>
                    ))}
                </div>
            )}

            {activeTab === "fertilizers" && (
                <div style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: 12, padding: "1rem 1.25rem" }}>
                    <SectionHeader icon="ti-droplet" title={t("fertilizers")} color={TAB_COLORS.fertilizers} />
                    {suggestions.fertilizers.map((item, i) => (
                        <div key={i} style={{ padding: "10px 12px", borderRadius: 8,
                            marginBottom: i < 2 ? 8 : 0,
                            background: "var(--surface-1)", border: "0.5px solid var(--border)"
                         }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 3 }}>
                                {item.name}
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                                    {item.application}
                                </div>
                            </div>
                         </div>
                    ))}
                </div>
            )}

            {activeTab === "planting" && (
                <div style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: 12, padding: "1rem 1.25rem" }}>
                    <SectionHeader icon="ti-seeding" title={t("plantingTips")} color={TAB_COLORS.planting} />
                    {suggestions.plantingTips.map((item, i) => (
                        <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start",
                            marginBottom: i < 2 ? 12 : 0,
                         }}>
                            <i className="ti ti-check" style={{ 
                                fontSize: 14, color: TAB_COLORS.planting, marginTop: 1, flexShrink: 0
                            }} aria-hidden="true" />
                            <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                                {item.tip}
                            </div>
                            <div>
                            </div>
                         </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function SectionHeader({ icon, title, color }: { icon: string; title: string; color: string }) {
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 14
        }}>
            <div style={{
                width: 30, height: 30, borderRadius: 8, background: color + "18",
                display: "flex", alignItems: "center", justifyContent: "center",
            }}>
                <i className={`ti ${icon}`} style={{
                    fontSize: 15, color
                }} aria-hidden="true" />
            </div>
            <span style={{
                fontSize: 14, fontWeight: 600, color: "var(--text-primary)"
            }}>
                {title}
            </span>
        </div>
    );
}