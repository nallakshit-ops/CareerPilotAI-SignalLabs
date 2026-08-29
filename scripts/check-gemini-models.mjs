import { GoogleGenerativeAI } from "@google/generative-ai";

const keys = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean);

async function listModels() {
  for (const [idx, key] of keys.entries()) {
    console.log(`\nTesting Key ${idx + 1}...`);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
      const data = await res.json();
      if (data.models) {
        console.log(`Key ${idx + 1} has ${data.models.length} models:`);
        const supported = data.models
          .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
          .map((m) => m.name);
        console.log(supported.slice(0, 15));
      } else {
        console.log(`Key ${idx + 1} error:`, data.error?.message || data);
      }
    } catch (err) {
      console.error(`Key ${idx + 1} request error:`, err);
    }
  }
}

listModels();
