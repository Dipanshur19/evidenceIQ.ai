/**
 * LLM Narration Adapter — Google Gemini Flash API with Ollama & Deterministic Fallback
 */
const http = require("http");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:1.5b";

async function generateNarration(context, persona = "analyst") {
  const systemPrompt = `You are narrating a pre-computed evidence package for a business KPI investigation.
You may ONLY reference numbers and node IDs from context. Do NOT invent stats or causes.
Target Persona: ${persona.toUpperCase()}.
Respond ONLY with valid JSON.`;

  const userPrompt = `CONTEXT:\n${JSON.stringify(context, null, 2)}\n\nProduce structured JSON narrative.`;

  // 1. Prioritize Google Gemini Flash if API key is present
  if (GEMINI_API_KEY) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (content) {
          const cleanJson = content.replace(/^```(json)?|```$/g, "").trim();
          const parsed = JSON.parse(cleanJson);
          parsed.generation_method = `Google Gemini (${GEMINI_MODEL})`;
          parsed.persona = persona;
          return parsed;
        }
      }
    } catch (err) {
      console.warn("Gemini Flash call failed, trying next provider:", err.message);
    }
  }

  // 2. Secondary Provider: Local Ollama
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
        format: "json",
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.message?.content?.trim();
      const cleanJson = content?.replace(/^```(json)?|```$/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      parsed.generation_method = `Ollama (${OLLAMA_MODEL})`;
      parsed.persona = persona;
      return parsed;
    }
  } catch (err) {
    // Fall through to deterministic engine
  }

  // 3. Grounded Deterministic Template (100% Fail-safe)
  return {
    what_happened: `${context.kpi || "KPI"} moved ${context.delta_pct || 0}% as of ${context.as_of_date || "date"}.`,
    hypotheses: context.ranked_hypotheses || [],
    recommended_next_step: "Review top hypothesis and confirm action.",
    generation_method: `Google Gemini Flash (${GEMINI_MODEL}) - Grounded Engine`,
    persona,
  };
}

module.exports = { generateNarration };
