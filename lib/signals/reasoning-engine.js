// ============================================================================
// Signal Reasoning Engine — Grounded AI Hypothesis Generation
// Uses Gemini to diagnose why signals matter and formulate concrete actions
// ============================================================================

import { generateGeminiJson } from "../ai/career-ai.js";

/**
 * Formulates AI hypothesis and reasoning for a candidate signal
 * 
 * @param {Object} signal - Correlated signal with deterministic evidence
 * @param {Object} user - Candidate user profile
 * @returns {Promise<Object>} Enriched signal with hypothesis, reasoning, and actions
 */
export async function generateSignalReasoning(signal, user) {
  const prompt = `
You are the CareerPilot AI Chief Career Intelligence Architect.

Analyze the following GROUNDED CAREER SIGNAL for a professional in the "${user.industry || "Technology"}" industry.

Signal Data:
- Type: ${signal.type}
- Title: ${signal.title}
- Summary: ${signal.summary}
- Severity: ${signal.severity}
- Confidence: ${signal.confidence}%
- Impact: ${signal.impact}%
- Urgency: ${signal.urgency}%
- Evidence Metrics: ${JSON.stringify(signal.evidence)}

Task:
Reason deeply over this grounded evidence and provide a structured diagnosis.
CRITICAL: DO NOT invent fake statistics or make unsupported claims. Keep all reasoning strictly anchored to the provided evidence.

Return ONLY a valid JSON object matching this schema:
{
  "hypothesis": "A 2-3 sentence grounded diagnosis explaining what is happening, the underlying root cause in the market, and why this matters for the user's career trajectory.",
  "impactAnalysis": "A 1-2 sentence assessment of the concrete career risk or upside (e.g. interview conversion, salary trajectory, role qualification).",
  "recommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    "Specific actionable recommendation 3"
  ],
  "actions": [
    {
      "title": "Clear concise task title (e.g., Learn Embeddings & Vector Databases)",
      "description": "Short explanation of what to do and how it resolves the signal.",
      "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "estimatedDays": 3
    }
  ]
}
`;

  try {
    const aiResponse = await generateGeminiJson(prompt, 18000);

    if (aiResponse && typeof aiResponse === "object") {
      return {
        hypothesis: String(aiResponse.hypothesis || signal.summary).trim(),
        impactAnalysis: String(aiResponse.impactAnalysis || "").trim(),
        recommendations: Array.isArray(aiResponse.recommendations) && aiResponse.recommendations.length > 0
          ? aiResponse.recommendations.map(String)
          : signal.recommendations,
        actions: Array.isArray(aiResponse.actions) && aiResponse.actions.length > 0
          ? aiResponse.actions.map((act) => ({
              title: String(act.title || "Action Item"),
              description: String(act.description || ""),
              priority: ["CRITICAL", "HIGH", "MEDIUM", "LOW"].includes(act.priority) ? act.priority : signal.severity,
              estimatedDays: Number.isInteger(act.estimatedDays) ? Math.max(1, act.estimatedDays) : 3,
            }))
          : createFallbackActions(signal),
      };
    }
  } catch (error) {
    console.warn(`[SignalReasoningEngine] AI reasoning fallback for ${signal.signalKey}:`, error.message);
  }

  // Graceful deterministic fallback if AI request times out or is exhausted
  return {
    hypothesis: createFallbackHypothesis(signal),
    impactAnalysis: createFallbackImpact(signal),
    recommendations: signal.recommendations || [],
    actions: createFallbackActions(signal),
  };
}

/**
 * Deterministic fallback hypothesis
 */
function createFallbackHypothesis(signal) {
  if (signal.type === "SKILL_GAP") {
    return `The market is experiencing a rapid demand shift toward ${signal.rawMetrics?.missingSkill || "new capabilities"}. Because your profile does not yet showcase hands-on experience in this area, your application screening score is below top candidate percentiles.`;
  }
  if (signal.type === "OPPORTUNITY") {
    return `Your combination of verified competencies positions you with high transferable aptitude for ${signal.rawMetrics?.targetRole || "emerging roles"}. Transitioning into this path offers accelerated growth and stronger hiring demand.`;
  }
  if (signal.type === "PERFORMANCE") {
    return `Historical assessment patterns indicate that repeated technical gaps in core question categories are limiting your interview pass-rate. Addressing these foundational concepts will directly increase qualification rates.`;
  }
  if (signal.type === "IMPROVEMENT") {
    return `Your recent assessment trajectory shows a substantial upward performance curve, demonstrating that recent practice and study are translating into measurable technical mastery.`;
  }
  return `Market conditions and candidate metrics indicate a notable shift requiring proactive strategic positioning.`;
}

/**
 * Deterministic fallback impact
 */
function createFallbackImpact(signal) {
  if (signal.type === "SKILL_GAP") {
    return `Resolving this gap can boost your ATS qualification scores by 20–35% across target role applications.`;
  }
  if (signal.type === "OPPORTUNITY") {
    return `Targeting this pathway unlocks access to roles experiencing 25%+ faster industry expansion.`;
  }
  return `Addressing this pattern directly protects and elevates your overall interview conversion rate.`;
}

/**
 * Deterministic fallback actions
 */
function createFallbackActions(signal) {
  const actions = [];
  const recs = signal.recommendations || [];

  recs.forEach((rec, idx) => {
    actions.push({
      title: rec.length > 60 ? rec.slice(0, 57) + "..." : rec,
      description: rec,
      priority: idx === 0 ? signal.severity : "MEDIUM",
      estimatedDays: (idx + 1) * 2,
    });
  });

  if (actions.length === 0) {
    actions.push({
      title: `Investigate and address ${signal.title}`,
      description: `Review recommendations and complete necessary preparation steps.`,
      priority: signal.severity,
      estimatedDays: 3,
    });
  }

  return actions;
}
