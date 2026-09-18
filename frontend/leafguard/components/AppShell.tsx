"use client";

import { useLocale } from "@/hooks/useLocale"
import { useState, useCallback } from "react";
import { predictDisease, PredictResponse } from "@/libs/api";
import LanguageSwitcher from "./LanguageSwitcher";
import ModelSelector from "./ModelSelector";
import ImageUpload from "./ImageUpload";
import DiagnosisResult from "./DiagnosisResult";
import SuggestionsPanel from "./SuggestionsPanel";
import ChatPanel from "./ChatPanel";


type Stage = "idle" | "loading" | "done" | "error"

const MODEL_ACCENT = { plant: "#1D9E75", rice: "#378ADD" }

export default function AppShell() {
    const {lang, setLang, t} = useLocale("en");
    const [modelType, setModelType] = useState<"plant" | "rice">("plant");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [stage, setStage] = useState<Stage>("idle");
    const [result, setResult] = useState<PredictResponse | null>(null);
    const [errorMsg, setErrorMsg] = useState("");
    const accent = MODEL_ACCENT[modelType];

    const handleFile = useCallback((file: File) => {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setStage("idle");
        setResult(null);
        setErrorMsg("");
    }, []);

    const handleModelChange = (m: "plant" | "rice") => {
        setModelType(m);
        setStage("idle");
        setResult(null);
        setImageFile(null);
        setImagePreview(null);
        setErrorMsg("")
    };

    async function handleDiagnose() {
        if(!imageFile) return;
        setStage("loading");
        setResult(null);
        setErrorMsg("");
        try {
            const data = await predictDisease(imageFile, modelType, lang);
            setResult(data);
            setStage("done");
        } catch(e: unknown) {
            setErrorMsg(e instanceof Error ? e.message : "Unknown error");
            setStage("error");
        }
    }    


    return (
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "1.5rem 1rem"}}>

        <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem"}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <div style={{
                    width: 40, height: 40, borderRadius: 10, background: accent + "20", display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    < i className="ti ti-leaf" style={{ fontSize: 22, color: accent}} />
                </div>

                <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>
                        {t("appName")}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-secondary)", lineHeight: 1.2}}>
                        {t("tagline")}
                    </div>
                </div>  
            </div>

            <LanguageSwitcher lang={lang} setLang={setLang} />

        </div>

        <ModelSelector modelType={modelType} setModelType={handleModelChange} t={t}/>

        <ImageUpload 
            imagePreview={imagePreview}
            onFile={handleFile}
            t={t}
            modelType={modelType} />
        
        {imagePreview && stage !== "loading" && (
            <button
                onClick={handleDiagnose}
                style={{
                    width: "100%", padding: "11px 0",
                    borderRadius: "var(--radius)",
                    marginBottom: "1rem",
                    background: accent, color: "#fff",
                    border: "none", fontSize: 14, fontWeight: 600,
                    cursor: "pointer",
                    display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 8,
                    transition: "opacity 0.15s"
                }}    
            >
                <i className="ti ti-microscope" aria-hidden="true" />
                {t("diagnoseBtn")}
            </button>
        )}

        {stage === "loading" && (
            <div style={{
                textAlign: "center", padding: "1.5rem",
                background: "var(--surface-1)",
                border: "0.5px solid var(--border)",
                borderRadius: 12, marginBottom: "1rem"
            }}>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 10 }}>
                    {t("analyzing")}
                </div>
                <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{
                        height: "100%", background: accent,
                        borderRadius: 2, width: "60%",
                        animation: "progress 1.2s ease-in-out infinite"
                    }} />
                </div>
            </div>
        )}

        {stage === "error" && (
            <div style={{
                padding: "1rem 1.25rem", marginBottom: "1rem",
                background: "#FCEBEB", border: "0.5px solid #E24B4A",
                borderRadius: 12, color: "#A32D2D", fontSize: 13,
            }}>
                <i className="ti ti-alert-circle" style={{
                    marginRight: 6
                }} aria-hidden="true" />
                {t("errorGeneral")}
                {errorMsg && (
                    <div style={{
                        marginTop: 4, fontSize: 11, opacity: 0.7
                    }}>{errorMsg}</div>
                )}
            </div>
        )}

        {stage === "done" && result && (
            <>
                <DiagnosisResult result={result} t={t} />
                <SuggestionsPanel suggestions={result.suggestions} t={t} modelType={modelType} />
                <div style={{marginTop: 12}}>
                    <ChatPanel
                        disease={result.detection.top1.label}
                        severity={result.suggestions.severity}
                        lang={lang}
                        t={t}
                        modelType={modelType}
                    />
                </div>
            </>
        )}
                
        </div>
    );

}

