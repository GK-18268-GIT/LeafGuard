"use Client";
import { useRef, useCallback, useState } from "react";
import Image from "next/image";

interface Props {
    imagePreview: string | null;
    onFile: (file: File) => void;
    t: (key: string) => string;
    modelType: "plant" | "rice";
}

const MODEL_COLOR = { plant: "#1D9E75", rice: "#378ADD" }

export default function ImageUpload({ imagePreview, onFile, t, modelType }: Props) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);
    const accent = MODEL_COLOR[modelType];

    const handleFile = useCallback(
        (file: File | undefined) => {
            if (!file || !file.type.startsWith("image/")) return;
            onFile(file);
        },
        [onFile]
    );

    return (

        <div
            onClick={() => fileRef.current?.click()}
            onDrop={(e) => { e.preventDefault(); setDragOver(false);
                handleFile(e.dataTransfer.files[0]);}}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            role="button"
            tabIndex={0}
            aria-label={t("uploadPrompt")}
            onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
            style={{
                border: `1.5px dashed ${dragOver ? accent : "var(--border-strong)"}`,
                borderRadius: 12,
                overflow: "hidden",
                cursor: "pointer",
                background: dragOver ? accent + "09" : "var(--surface-1)",
                transition: "border-color 0.2s, background 0.2s",
                minHeight: imagePreview ? 200 : 130,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                marginBottom: "1rem"
            }}
        >
            {imagePreview ? (
                <Image
                    src={imagePreview}
                    alt="Uploaded leaf"
                    fill
                    sizes="100vw"
                    style={{ objectFit: "cover" }}
                />
            ) : (
                <div style={{ textAlign: "center", padding: "1.5rem 1rem" }}>
                    <i className="ti ti-photo-up"
                    aria-hidden="true"
                    style={{ fontSize: 36, color: "var(--text-muted)", display: "block", marginBottom: 10 }} />
                <div style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 500 }}>
                    {t("uploadPrompt")}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                    {t("uploadHint")}
                </div>

                </div>
            )}
            <input  
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files?.[0])}
                aria-hidden="true"
            />
        </div>
    );

}