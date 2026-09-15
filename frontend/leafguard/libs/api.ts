//import axios from "axios"
import type { Locale } from "@/hooks/useLocale"

const BASE = "/api"

export interface PredictionTop {label: string; probability: number}
export interface AgronomicTechnique {title: string; detail: string}
export interface Fertilizer {name: string; application: string}
export interface PlantingTip {tip: string;}

export interface Suggestions {
    severity: "healthy" | "low" | "medium" | "high";
    urgency: string;
    description: string;
    agronomicTechniques: AgronomicTechnique[];
    fertilizer: Fertilizer[];
    plantingTips: PlantingTip[];
}

export interface PredictResponse {
    detection: { top1: PredictionTop; top3: PredictionTop[] };
    suggestions: Suggestions;
    lang: string;
    model_type: string;
}

export async function predictDisease(
    file: File,
    modelType: "plant" | "rice",
    lang: Locale
): Promise<PredictResponse> {
    const form = new FormData();
    form.append("file", file);
    form.append("model_type", modelType);
    form.append("lang", lang);
    const response = await fetch(`${BASE}/predict`, {
        method: "POST",
        body: form,
    });
    if (!response.ok) throw new Error(`Prediction request failed: ${response.status}`);
    return response.json() as Promise<PredictResponse>;
}

export interface ChatMessage { role: "user" | "assistant", content: string; }

export async function sendChat(
    messages:ChatMessage[],
    disease: string,
    severity: string,
    lang: Locale
): Promise<string> {
    const response = await fetch(`${BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, disease, severity, lang }),
    });
    if (!response.ok) throw new Error(`Chat request failed: ${response.status}`);
    const data = await response.json() as { reply: string };
    return data.reply;
}