// ============================================================================
// Gemini API Key Pool - Round-robin rotation with automatic failover
// ============================================================================

const rawKeys = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
].filter(Boolean);

// Filter out obvious placeholder keys
let GEMINI_KEYS = rawKeys.filter(
  (k) => k && k.length > 20 && !k.includes("YOUR_") && !k.includes("placeholder")
);

const disabledKeys = new Set();

if (GEMINI_KEYS.length === 0) {
  console.error("⚠️ No valid Gemini API keys configured. Set GEMINI_API_KEY in env.");
}

let currentKeyIndex = 0;

/**
 * Gets the next valid API key in round-robin order
 * @returns {string}
 */
export function getNextGeminiKey() {
  const activeKeys = GEMINI_KEYS.filter((k) => !disabledKeys.has(k));
  if (activeKeys.length === 0) {
    // If all were disabled, reset to retry
    disabledKeys.clear();
  }

  const pool = activeKeys.length > 0 ? activeKeys : GEMINI_KEYS;
  const key = pool[currentKeyIndex % pool.length];
  currentKeyIndex = (currentKeyIndex + 1) % pool.length;
  return key;
}

/**
 * Executes a Gemini API call with automatic key rotation on 429 errors
 * @param {Function} apiCall - Async function that takes an API key and returns a promise
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise}
 */
export async function executeWithKeyRotation(apiCall, maxRetries = null) {
  const activeKeys = GEMINI_KEYS.filter((k) => !disabledKeys.has(k));
  const retries = maxRetries || Math.max(activeKeys.length, 1);
  let lastError = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    const key = getNextGeminiKey();

    try {
      const result = await apiCall(key);
      return result;
    } catch (error) {
      lastError = error;

      // If key is invalid, permanently disable it in pool
      if (
        error.message?.includes("API key not valid") ||
        error.message?.includes("API_KEY_INVALID")
      ) {
        disabledKeys.add(key);
        console.warn(`⚠️ Permanently disabling invalid API key. Active keys remaining: ${GEMINI_KEYS.length - disabledKeys.size}`);
        continue;
      }

      const isKeyOrRateLimitError =
        error.status === 429 ||
        error.status === 400 ||
        error.status === 401 ||
        error.status === 403 ||
        error.status === 503 ||
        error.message?.includes("quota") ||
        error.message?.includes("rate limit") ||
        error.message?.includes("429");

      if (isKeyOrRateLimitError && attempt < retries - 1) {
        console.warn(
          `⚠️ Gemini API rate-limited (${error.status || error.message}) on key attempt ${attempt + 1}/${retries}. Rotating...`
        );
        continue;
      }

      throw error;
    }
  }

  throw (
    lastError || new Error("All Gemini API keys exhausted. Please try again later.")
  );
}

/**
 * Gets the total number of configured API keys
 * @returns {number}
 */
export function getKeyPoolSize() {
  return GEMINI_KEYS.length;
}
