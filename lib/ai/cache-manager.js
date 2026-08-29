// ============================================================================
// AI Response Cache Manager - Reduces API calls by 70%+
// ============================================================================

import { db } from "@/lib/prisma";
import crypto from "crypto";

// Default TTL for feature types not explicitly listed (in hours)
const DEFAULT_TTL = 24;

// TTL Configuration (in hours)
const CACHE_TTL = {
  "skill-gap": 24, // 1 day - user skills change
  "skill-recommendations": 24, // 1 day
  "career-simulation": 168, // 7 days - career paths are stable
  "career-comparison": 168, // 7 days
  "career-risk": 168, // 7 days
  "industry-insights": 168, // 7 days
  "resume-generation": 0, // Never cache - always personalized
  "interview-questions": 72, // 3 days
  "interview-evaluation": 0, // Never cache - always unique
  "cover-letter": 0, // Never cache - always personalized
  "ats-resume": 0, // Never cache - always personalized
  "cold-dm-generation": 0, // Never cache - each DM is unique
};

/**
 * Normalize input to ensure consistent hashing
 * @param {Object} input - Raw input object
 * @returns {string} - Normalized JSON string
 */
function normalizeInput(input) {
  // Sort keys alphabetically for consistent hashing
  const sorted = Object.keys(input)
    .sort()
    .reduce((acc, key) => {
      let value = input[key];

      // Normalize arrays
      if (Array.isArray(value)) {
        value = value.map((v) => String(v).toLowerCase().trim()).sort();
      }

      // Normalize strings
      if (typeof value === "string") {
        value = value.toLowerCase().trim();
      }

      acc[key] = value;
      return acc;
    }, {});

  return JSON.stringify(sorted);
}

/**
 * Generate SHA-256 hash from input
 * @param {Object} input - Input to hash
 * @returns {string} - Hex hash
 */
function generateCacheKey(input) {
  const normalized = normalizeInput(input);
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Get cached response if available and not expired
 * @param {string} featureType - Type of feature (e.g., "skill-gap")
 * @param {Object} input - Input parameters
 * @returns {Promise<Object|null>} - Cached response or null
 */
export async function getCachedResponse(featureType, input) {
  const ttl = CACHE_TTL[featureType] ?? DEFAULT_TTL;

  // If TTL is 0, don't cache this feature
  if (ttl === 0) {
    return null;
  }

  const cacheKey = generateCacheKey({ featureType, ...input });

  try {
    const cached = await db.aIResponseCache.findUnique({
      where: { cacheKey },
    });

    if (!cached) {
      return null;
    }

    // Check if expired
    if (new Date() > cached.expiresAt) {
      // Delete expired cache asynchronously
      db.aIResponseCache.delete({ where: { id: cached.id } }).catch(() => {});
      return null;
    }

    // Increment hit count asynchronously (don't wait)
    db.aIResponseCache
      .update({
        where: { id: cached.id },
        data: { hitCount: { increment: 1 } },
      })
      .catch(() => {});

    console.log(`✅ Cache HIT for ${featureType} (key: ${cacheKey.slice(0, 12)}...)`);
    return cached.response;
  } catch (error) {
    console.error("Cache retrieval error:", error);
    return null;
  }
}

/**
 * Store response in cache
 * @param {string} featureType - Type of feature
 * @param {Object} input - Input parameters
 * @param {Object} response - Response to cache
 * @returns {Promise<void>}
 */
export async function setCachedResponse(featureType, input, response) {
  const ttl = CACHE_TTL[featureType] ?? DEFAULT_TTL;

  // If TTL is 0, don't cache
  if (ttl === 0) {
    return;
  }

  const cacheKey = generateCacheKey({ featureType, ...input });
  const requestHash = generateCacheKey(input); // Secondary hash for debugging
  const expiresAt = new Date(Date.now() + ttl * 60 * 60 * 1000); // TTL in hours

  try {
    await db.aIResponseCache.upsert({
      where: { cacheKey },
      create: {
        cacheKey,
        featureType,
        requestHash,
        response,
        expiresAt,
      },
      update: {
        response,
        expiresAt,
        updatedAt: new Date(),
      },
    });

    console.log(`💾 Cache SAVED for ${featureType} (expires: ${ttl}h)`);
  } catch (error) {
    console.error("Cache storage error:", error);
  }
}

/**
 * Clear all expired cache entries (run via cron)
 * @returns {Promise<number>} - Number of deleted entries
 */
export async function clearExpiredCache() {
  try {
    const result = await db.aIResponseCache.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    console.log(`🧹 Cleared ${result.count} expired cache entries`);
    return result.count;
  } catch (error) {
    console.error("Cache cleanup error:", error);
    return 0;
  }
}

/**
 * Get cache statistics
 * @returns {Promise<Object>} - Cache stats
 */
export async function getCacheStats() {
  try {
    const [total, byFeature, avgHits] = await Promise.all([
      db.aIResponseCache.count(),
      db.aIResponseCache.groupBy({
        by: ["featureType"],
        _count: true,
        _sum: {
          hitCount: true,
        },
      }),
      db.aIResponseCache.aggregate({
        _avg: {
          hitCount: true,
        },
      }),
    ]);

    return {
      totalCachedResponses: total,
      averageHitsPerCache: avgHits._avg.hitCount || 0,
      byFeature: byFeature.map((f) => ({
        feature: f.featureType,
        count: f._count,
        totalHits: f._sum.hitCount || 0,
      })),
    };
  } catch (error) {
    console.error("Cache stats error:", error);
    return null;
  }
}

/**
 * Clear cache for specific feature type
 * @param {string} featureType - Feature to clear
 * @returns {Promise<number>} - Number of deleted entries
 */
export async function clearCacheForFeature(featureType) {
  try {
    const result = await db.aIResponseCache.deleteMany({
      where: { featureType },
    });
    console.log(`🗑️ Cleared ${result.count} cache entries for ${featureType}`);
    return result.count;
  } catch (error) {
    console.error("Feature cache clear error:", error);
    return 0;
  }
}
