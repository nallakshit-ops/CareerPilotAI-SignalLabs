// ============================================================================
// Gemini API with Caching + Key Rotation - Complete Integration
// ============================================================================

import { GoogleGenerativeAI } from "@google/generative-ai";
import { executeWithKeyRotation } from "./gemini-pool";
import { getCachedResponse, setCachedResponse } from "./cache-manager";

/**
 * Execute Gemini API call with automatic caching and key rotation
 * 
 * @param {string} featureType - Feature name for cache TTL lookup
 * @param {Object} input - Input parameters (used for cache key generation)
 * @param {string} prompt - The actual prompt to send to Gemini
 * @param {Object} options - Additional options
 * @param {string} options.model - Gemini model to use (default: gemini-2.5-flash)
 * @param {number} options.maxTokens - Max tokens in response
 * @param {number} options.temperature - Temperature (0-1)
 * @returns {Promise<Object>} - Gemini response
 */
export async function executeGeminiWithCache(
  featureType,
  input,
  prompt,
  options = {}
) {
  const {
    model = "gemini-2.5-flash",
    maxTokens = 2048,
    temperature = 0.7,
  } = options;

  // Try cache first
  const cached = await getCachedResponse(featureType, input);
  if (cached) {
    return { response: { text: () => JSON.stringify(cached) }, fromCache: true };
  }

  // Cache miss - call API with key rotation + model fallback
  const fallbackModels = [model, "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.5-flash-lite"];
  // Remove duplicates (in case the primary model is already in the fallback list)
  const modelChain = [...new Set(fallbackModels)];
  
  let result;
  let lastError;

  for (const modelName of modelChain) {
    try {
      result = await executeWithKeyRotation(async (apiKey) => {
        const genAI = new GoogleGenerativeAI(apiKey);
        const geminiModel = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            maxOutputTokens: maxTokens,
            temperature,
          }
        });
        return await geminiModel.generateContent(prompt);
      });
      break; // Success
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
    throw lastError || new Error("All Gemini models exhausted. Please try again later.");
  }

  // Parse and cache the response
  const responseText = result.response.text();
  
  // Try to parse as JSON for structured caching
  let parsedResponse;
  try {
    // Remove markdown code fences if present
    const cleaned = responseText
      .replace(/```(?:json)?\s*/gi, "")
      .replace(/```/g, "")
      .trim();
    
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      parsedResponse = JSON.parse(match[0]);
    } else {
      parsedResponse = { text: responseText };
    }
  } catch {
    parsedResponse = { text: responseText };
  }

  // Cache the response
  await setCachedResponse(featureType, input, parsedResponse);

  return { response: { text: () => responseText }, fromCache: false };
}

/**
 * Timeout wrapper for any promise
 */
export function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), ms)
    ),
  ]);
}
