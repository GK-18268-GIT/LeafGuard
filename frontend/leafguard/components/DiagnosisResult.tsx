"use client"
import { PredictResponse } from "@/libs/api";

interface Props {
    result: PredictResponse;
    t: (key: string) => string;
}

const SEV_STYLE: Record<string, { bg: string; text: string; border: string}> ={
    healthy: { bg: "#E1F5EE", text: "#0F6E56", border: "#1D9E75" },
    low: { bg: "#EAF3DE", text: "#3B6D11", border: "#639922" },
    medium: { bg: "#FAEEDA", text: "#854F0B", border: "#BA7517" },
    high: { bg: "#FCEBEB", text: "#A32D2D", border: "#E24B4A" },
};

function formatLabel(label: string) {
    return label.replace(/___/g, " - ").replace(/_/g, " ");
}

export default function DiagnosisResult({ result, t }: Props) {
    const { detection, suggestions } = result;;
    const sev = SEV_STYLE[suggestions.severity] ?? SEV_STYLE.medium;
    const confidence = detection.top1.probability;

    return (
        <div
            className="fade-in"
            style={{
                background: "var(--surface-2)",
                border: `0.5px solid ${sev.border}`,
                borderRadius: 12,
                padding: "1rem 1.25rem",
                marginBottom: 12
            }}
        >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 10}}>
                <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>
                        {formatLabel(detection.top1.label)}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                        {t("confidence")}: {(confidence * 100).toFixed(1)}%
                    </div>
                </div>
                <span
                    style={{
                        fontSize: 11, fontWeight: 600,
                        padding: "3px 10px", borderRadius: 20,
                        background: sev.bg, color: sev.text,
                        border: `0.5px solid ${sev.border}`,
                        whiteSpace: "nowrap",
                    }}
                >
                    {suggestions.urgency}
                </span>
            </div>

            <div style={{ background: "var(--border)", borderRadius: 4, height: 5, marginBottom: 10, overflow: "hidden" }}>
                <div 
                    style={{
                        height: "100%",
                        width: `${(confidence * 100).toFixed(1)}%`,
                        background: sev.border,
                        borderRadius: 4,
                        transition: "width 0.6s ease",
                    }} />
            </div>

            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 }}>
                {suggestions.description}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {detection.top3.map((item, i) => (
                        <div key={i}
                             style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 11, color: "var(--text-muted)", width: 14, textAlign: "right" }}>
                                    {i + 1}
                                </span>
                                <div style={{ flex: 1, background: "var(--border)", borderRadius: 3, height: 4, overflow: "hidden" }}>
                                    <div 
                                        style={{
                                            height: "100%",
                                            width: `${(item.probability * 100).toFixed(1)}%`, 
                                            background: i === 0 ? sev.border : "var(--border-strong)",
                                            borderRadius: 3
                                        }} />
                                    </div>

                                    <span style={{ fontSize: 11, color: "var(--text-secondary)", width: 36, textAlign: "right" }}>
                                        {(item.probability * 100).toFixed(0)}%
                                    </span>
                                    <span style={{ fontSize: 11, color: "var(--text-secondary)", flex: 2}}>
                                        {formatLabel(item.label)}
                                    </span>
                        </div>


                    ))}
            </div>

        </div>
    );

}