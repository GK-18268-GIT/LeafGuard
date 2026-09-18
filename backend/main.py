from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from google import genai
from google.genai import types
import torch, os, json
from dotenv import load_dotenv
from inference import load_model, predict, PLANT_DISEASE_CLASSES, RICE_LEAF_DISEASE_CLASSES
from translations import build_prompt, LANGUAGE_INSTRUCTIONS

load_dotenv()
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MODELS: dict = {}

# ── Gemini setup (google-genai SDK) ─────────────────────────────────────────
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
GEMINI_MODEL = "gemini-3.5-flash-lite"

@asynccontextmanager
async def lifespan(app: FastAPI):
    for name, path_env, classes in [
        ("plant", "PLANT_MODEL_PATH", PLANT_DISEASE_CLASSES),
        ("rice",  "RICE_MODEL_PATH",  RICE_LEAF_DISEASE_CLASSES),
    ]:
        path = os.getenv(path_env, f"models/{name}_disease_model.pth")
        if os.path.exists(path):
            MODELS[name] = load_model(path, len(classes), DEVICE)
            print(f"{name.capitalize()} model loaded on {DEVICE}")
        else:
            print(f"WARNING: {name} model not found at {path}")
    yield
    MODELS.clear()

app = FastAPI(title="LeafGuard API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv(
        "ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173"
    ).split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "device": str(DEVICE), "models": list(MODELS.keys())}

@app.post("/api/predict")
async def api_predict(
    file:       UploadFile = File(...),
    model_type: str        = Form("plant"),
    lang:       str        = Form("en"),
):
    if model_type not in ("plant", "rice"):
        raise HTTPException(400, "model_type must be 'plant' or 'rice'")
    if lang not in ("en", "si", "ta"):
        raise HTTPException(400, "lang must be 'en', 'si', or 'ta'")
    if model_type not in MODELS:
        raise HTTPException(503, f"{model_type} model not loaded")

    # ── CNN inference ────────────────────────────────────────────────────────
    image_bytes = await file.read()
    classes = PLANT_DISEASE_CLASSES if model_type == "plant" else RICE_LEAF_DISEASE_CLASSES
    top3 = predict(image_bytes, MODELS[model_type], classes, DEVICE)
    top  = top3[0]

    # ── Gemini agronomic suggestions ─────────────────────────────────────────
    system_p, user_p = build_prompt(top["label"], model_type, top["probability"], lang)

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=f"{system_p}\n\n{user_p}",
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                max_output_tokens=2048,
                temperature=0.4,
            ),
        )
        suggestions = json.loads(response.text)
    except Exception as e:
        raise HTTPException(502, f"Gemini API error: {e}")

    return {
        "detection":   {"top1": top, "top3": top3},
        "suggestions": suggestions,
        "lang":        lang,
        "model_type":  model_type,
    }

@app.post("/api/chat")
async def api_chat(body: dict):
    lang     = body.get("lang", "en")
    disease  = body.get("disease", "unknown disease")
    severity = body.get("severity", "unknown")
    messages = body.get("messages", [])

    if not messages:
        raise HTTPException(400, "messages list is empty")

    lang_instr = LANGUAGE_INSTRUCTIONS.get(lang, LANGUAGE_INSTRUCTIONS["en"])
    system = (
        f"You are an expert agronomist for LeafGuard. {lang_instr}\n"
        f"Diagnosed disease: '{disease}' (severity: {severity}). "
        "Answer crop management questions concisely."
    )

    # ── Build contents list for new SDK ─────────────────────────────────────
    contents = []
    for i, m in enumerate(messages):
        role = "user" if m["role"] == "user" else "model"
        # Prepend system prompt to the first user message
        text = f"{system}\n\n{m['content']}" if i == 0 and role == "user" else m["content"]
        contents.append(types.Content(
            role=role,
            parts=[types.Part(text=text)]
        ))

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                max_output_tokens=512,
                temperature=0.7,
            ),
        )
    except Exception as e:
        raise HTTPException(502, f"Gemini API error: {e}")

    return {"reply": response.text}