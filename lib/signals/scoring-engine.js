// ============================================================================
// Signal Scoring Engine — Priority & Severity Computation
// Computes composite signal score: Impact × Confidence × Urgency
// ============================================================================

/**
 * Computes deterministic score and severity for a signal
 * 
 * @param {Object} params
 * @param {number} params.impact - 0 to 100
 * @param {number} params.confidence - 0 to 100
 * @param {number} params.urgency - 0 to 100
 * @returns {Object} { score: number, severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' }
 */
export function calculateSignalScore({ impact = 50, confidence = 50, urgency = 50 }) {
  const imp = Math.min(Math.max(Number(impact) || 0, 0), 100);
  const conf = Math.min(Math.max(Number(confidence) || 0, 0), 100);
  const urg = Math.min(Math.max(Number(urgency) || 0, 0), 100);

  // Weighted composite score (Impact: 45%, Confidence: 30%, Urgency: 25%)
  const rawScore = imp * 0.45 + conf * 0.30 + urg * 0.25;
  const score = Math.round(Math.min(Math.max(rawScore, 0), 100));

  let severity = "LOW";
  if (score >= 80) {
    severity = "CRITICAL";
  } else if (score >= 60) {
    severity = "HIGH";
  } else if (score >= 40) {
    severity = "MEDIUM";
  } else {
    severity = "LOW";
  }

  return { score, severity };
}

/**
 * Scores and sorts a list of signals
 * 
 * @param {Array<Object>} signals
 * @returns {Array<Object>} Sorted signals by score descending
 */
export function scoreAndRankSignals(signals = []) {
  return signals
    .map((signal) => {
      const { score, severity } = calculateSignalScore({
        impact: signal.impact,
        confidence: signal.confidence,
        urgency: signal.urgency,
      });

      return {
        ...signal,
        score,
        severity,
      };
    })
    .sort((a, b) => b.score - a.score);
}
