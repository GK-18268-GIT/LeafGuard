"use client"

interface Props {
    modelType: "plant" | "rice";
    setModelType: (m: "plant" | "rice") => void;
    t: (key: string) => string;
}

const MODELS = [
    { id: "plant" as const, icon: "ti-plant-2", colorVar: "#1D9E75" },
    { id: "rice" as const, icon: "ti-grain", colorVar: "#378ADD" },
];

export default function ModelSelector({ modelType, setModelType, t }: Props) {
    return (
        <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
            {MODELS.map(({ id, icon, colorVar }) => {
                const active = modelType === id;
                return (
                    <button
                        key={id}
                        onClick={() => setModelType(id)}
                        aria-pressed={active}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 7,
                            padding: "8px 16px",
                            borderRadius: "var(--radius)",
                            border: active ? `1.5px solid ${colorVar}` : "0.5px solid var(--border-strong)",
                            background: active ? colorVar + "14" : "var(--surface-1)",
                            color: active ? colorVar : "var(--text-secondary)",
                            fontSize: 13,
                            fontWeight: active ? 600 : 400,
                            cursor: "pointer",
                            transition: "all 0.15s",
                        }}
                    >
                        <i className={`ti ${icon}`} aria-hidden="true" style={{ fontSize: 16 }} />
                        {t(id === "plant" ? "plantModel" : "riceModel")}
                    </button>
                )
            })}
        </div>
    )
}