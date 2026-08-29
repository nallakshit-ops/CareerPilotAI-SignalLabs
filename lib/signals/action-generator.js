// ============================================================================
// Action Generator — Actionable Career Tasks & Deep Linking
// Converts signal recommendations into trackable interactive tasks
// ============================================================================

import { getRecommendations } from "../services/recommendation-engine.js";

/**
 * Generates structured, deep-linked actions for a signal
 * 
 * @param {Object} signal - Enriched signal
 * @param {string} userId - Candidate user ID
 * @returns {Array<Object>} List of CareerAction objects ready for DB
 */
export function generateSignalActions(signal, userId) {
  const actions = [];
  const rawActions = Array.isArray(signal.actions) ? signal.actions : [];

  for (const [index, rawAct] of rawActions.entries()) {
    let actionUrl = null;

    // Determine smart deep link based on signal type and content
    if (signal.type === "SKILL_GAP") {
      const missingSkill = signal.rawMetrics?.missingSkill;
      if (missingSkill) {
        const courses = getRecommendations([missingSkill]);
        if (courses.length > 0 && courses[0].url) {
          actionUrl = courses[0].url;
        } else {
          actionUrl = "/resume";
        }
      } else {
        actionUrl = "/resume";
      }
    } else if (signal.type === "OPPORTUNITY") {
      actionUrl = "/explore?tab=jobs";
    } else if (signal.type === "PERFORMANCE" || signal.type === "IMPROVEMENT") {
      actionUrl = "/interview";
    } else if (signal.type === "MARKET_CHANGE") {
      actionUrl = "/explore?tab=jobs";
    }

    // Default deep link if course URL is not external
    if (!actionUrl) {
      actionUrl = "/dashboard";
    }

    actions.push({
      userId,
      title: rawAct.title || `Action step ${index + 1}`,
      description: rawAct.description || null,
      priority: rawAct.priority || signal.severity || "MEDIUM",
      estimatedDays: rawAct.estimatedDays || (index + 1) * 2,
      actionUrl,
      status: "PENDING",
    });
  }

  return actions;
}
