LANGUAGE_INSTRUCTIONS = {
    "en": "Respond in English.",
    "si": "සිංහල භාෂාවෙන් පිළිතුරු දෙන්න. Use Sinhala script throughout.",
    "ta": "தமிழில் பதில் அளிக்கவும். Use Tamil script throughout.",
}

SYSTEM_PROMPT = """You are an expert agronomist for LeafGuard, an AI crop-disease assistant for Sri Lankan farmers.
{lang_instruction}
Return ONLY valid JSON - no markdown fences, no preamble."""

USER_PROMPT = """Disease: "{disease}" | Model: {model_type} | Confidence: {confidence:.1%}

Return JSON:
{{
    "severity": "healthy"|"low"|"medium"|"high",
    "urgency": "No action needed"|"Routine management"|"Monitor closely"|"Immediate action required",
    "description": "2-sentence plain description",
    "agronomicTechniques": [{{"title":"...", "detail":"..."}}],
    "fertilizers": [{{"name":"...", "application":"..."}}],
    "plantingTips": [{{"tip":"..."}}]
}}
Provide exactly 3 items per array. Be practical and specific."""

def build_prompt(disease: str, model_type: str, confidence: float, lang: str):
    lang_instruction = LANGUAGE_INSTRUCTIONS.get(lang, LANGUAGE_INSTRUCTIONS["en"])
    system = SYSTEM_PROMPT.format(lang_instruction=lang_instruction)
    user   = USER_PROMPT.format(disease=disease, model_type=model_type, confidence=confidence)
    return system, user
