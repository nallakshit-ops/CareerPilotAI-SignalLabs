// ============================================================================
// Signal Correlation Engine — Cross-Signal Intelligence
// Connects disparate signals, elevates compound risks, and deduplicates
// ============================================================================

/**
 * Correlates candidate signals and checks against existing user signals in DB
 * 
 * @param {Object} params
 * @param {Array<Object>} params.candidateSignals - Freshly detected candidate signals
 * @param {Array<Object>} params.existingSignals - Existing signals in DB for this user
 * @param {Object} params.userContext - Full user context (profile, applications, etc.)
 * @returns {Object} { signalsToUpsert: Array, signalsToResolve: Array }
 */
export function correlateSignals({
  candidateSignals = [],
  existingSignals = [],
  userContext = {},
}) {
  const existingSignalMap = new Map();
  existingSignals.forEach((sig) => {
    existingSignalMap.set(sig.signalKey, sig);
  });

  const correlatedSignals = [];
  const processedKeys = new Set();

  // 1. Cross-Signal Reasoning Rules
  const hasSkillGap = candidateSignals.some((s) => s.type === "SKILL_GAP");
  const hasOpportunity = candidateSignals.some((s) => s.type === "OPPORTUNITY");
  const hasPerformanceWeakness = candidateSignals.some(
    (s) => s.type === "PERFORMANCE" && s.signalKey.includes("weakness")
  );
  const hasMarketSurge = candidateSignals.some((s) => s.type === "MARKET_CHANGE");

  for (const signal of candidateSignals) {
    let correlated = { ...signal };
    processedKeys.add(signal.signalKey);

    // Rule A: Skill Gap + Active Job Applications + Market Surge = Elevate to CRITICAL RISK
    if (signal.type === "SKILL_GAP") {
      const appCount = signal.rawMetrics?.relatedApplicationsCount || 0;
      if (appCount > 0 && hasMarketSurge) {
        correlated.severity = "CRITICAL";
        correlated.impact = Math.min(correlated.impact + 10, 98);
        correlated.urgency = Math.min(correlated.urgency + 15, 96);
        correlated.title = `High-Priority Risk: ${signal.rawMetrics.missingSkill} Gap in Active Applications`;
        correlated.evidence.push({
          label: "Compound Risk Factor",
          value: "Active Application Barrier",
          details: `This skill directly impacts ${appCount} active job application(s) during peak hiring.`,
        });
      }
    }

    // Rule B: High Compatibility Opportunity + Market Surge = Elevate Urgency
    if (signal.type === "OPPORTUNITY" && hasMarketSurge) {
      correlated.urgency = Math.min(correlated.urgency + 15, 95);
      correlated.evidence.push({
        label: "Market Timing Advantage",
        value: "Immediate Window",
        details: "Hiring surge in your industry makes right now the ideal time to transition.",
      });
    }

    // Rule C: Performance Weakness + Active Applications = Elevate Urgency
    if (signal.type === "PERFORMANCE" && (userContext.user?.candidateApplications?.length || 0) > 0) {
      correlated.urgency = Math.min(correlated.urgency + 10, 95);
      correlated.evidence.push({
        label: "Interview Funnel Risk",
        value: "Active Candidate",
        details: "Improving your technical assessment score directly protects active application outcomes.",
      });
    }

    // 2. Deduplication & State Preservation with Existing DB Signals
    const existing = existingSignalMap.get(signal.signalKey);
    if (existing) {
      // Preserve existing lifecycle status (e.g. ACKNOWLEDGED or ACTION_STARTED) if still active
      correlated.id = existing.id;
      correlated.status = existing.status;
      correlated.detectedAt = existing.detectedAt;
      correlated.existingActions = existing.actions || [];
    } else {
      correlated.status = "ACTIVE";
      correlated.detectedAt = new Date();
    }

    correlatedSignals.push(correlated);
  }

  // 3. Detect signals that should be auto-resolved
  // If an existing ACTIVE / ACKNOWLEDGED skill gap signal's skill is now present in user skills, resolve it!
  const userSkillSet = new Set(
    (userContext.user?.skills || []).map((s) => s.toLowerCase().trim())
  );

  const signalsToResolve = [];
  existingSignals.forEach((existing) => {
    if (existing.status !== "RESOLVED" && existing.status !== "EXPIRED") {
      if (existing.type === "SKILL_GAP") {
        const skillKey = existing.signalKey.replace("skill_gap:", "").toLowerCase().trim();
        if (userSkillSet.has(skillKey)) {
          signalsToResolve.push({
            id: existing.id,
            signalKey: existing.signalKey,
            resolutionReason: `You successfully added ${skillKey} to your profile skills!`,
          });
        }
      }
    }
  });

  return {
    correlatedSignals,
    signalsToResolve,
  };
}
