import { GoogleGenerativeAI } from "@google/generative-ai";
import { executeWithKeyRotation } from "./gemini-pool.js";

function extractJsonBlock(text) {
  const cleaned = String(text || "")
    .replace(/```(?:json)?\s*/gi, "")
    .replace(/```/g, "")
    .trim();

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("No JSON object found in model response");
  }

  return match[0];
}

function withTimeout(promise, timeoutMs, timeoutMessage) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
    }),
  ]);
}

export function ensureGeminiConfigured() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
}

export async function generateGeminiJson(prompt, timeoutMs = 25000) {
  ensureGeminiConfigured();

  const models = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.5-flash-lite", "gemini-pro-latest"];
  let result;
  let lastError;

  for (const modelName of models) {
    try {
      result = await withTimeout(
        executeWithKeyRotation(async (apiKey) => {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              temperature: 0.7,
              responseMimeType: "application/json",
            },
          });
          return await model.generateContent(prompt);
        }),
        timeoutMs,
        "Gemini request timed out"
      );
      break;
    } catch (error) {
      lastError = error;
      const isRetryable =
        error.status === 429 ||
        error.status === 404 ||
        error.message?.includes("quota") ||
        error.message?.includes("rate limit") ||
        error.message?.includes("429") ||
        error.message?.includes("404") ||
        error.message?.includes("no longer available") ||
        error.message?.includes("not found");

      if (isRetryable) {
        console.warn(`⚠️ Model ${modelName} unavailable/rate-limited, trying next model...`);
        continue;
      }
      throw error;
    }
  }

  if (!result) {
    throw lastError || new Error("All Gemini models exhausted.");
  }

  const text = result?.response?.text?.() || "";
  const jsonBlock = extractJsonBlock(text);
  return JSON.parse(jsonBlock);
}

export function sanitizeStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean);
}

export function parseCsvParam(paramValue) {
  if (!paramValue) return [];
  return String(paramValue)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function clampNumber(value, min, max, fallback = min) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}
