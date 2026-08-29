// ============================================================================
// Market Change Detector — Deterministic Signal Intelligence
// Analyzes industry growth, market outlook, and macro skill demand shifts
// ============================================================================

/**
 * Detects macro market change signals
 * 
 * @param {Object} context
 * @param {Object} context.user - Candidate profile
 * @param {Object} context.industryInsight - Current industry market trends & outlook
 * @param {Array} context.jobs - Active job postings in the candidate's domain
 * @returns {Array<Object>} List of candidate market change signals
 */
export async function detectMarketChangeSignals({ user, industryInsight, jobs = [] }) {
  const candidateSignals = [];
  if (!user || !industryInsight) return candidateSignals;

  const industryName = user.industry || industryInsight.industry || "General Tech";
  const growthRate = industryInsight.growthRate || 0;
  const demandLevel = industryInsight.demandLevel || "Medium";
  const marketOutlook = industryInsight.marketOutlook || "Neutral";
  const keyTrends = Array.isArray(industryInsight.keyTrends) ? industryInsight.keyTrends : [];

  // Sample top 3 active jobs for direct in-card links
  const topMatchedJobs = jobs.slice(0, 3).map((j) => ({
    id: j.id,
    title: j.title,
    companyName: j.companyName,
    location: j.location,
    employmentType: j.employmentType,
    url: `/explore?tab=jobs`,
  }));

  // Scenario 1: High Market Demand & Growth Surge
  if (demandLevel.toLowerCase() === "high" || growthRate >= 20 || marketOutlook.toLowerCase() === "positive") {
    const confidence = 90;
    const impact = 80;
    const urgency = 70;
    const trendHighlight = keyTrends.length > 0 ? keyTrends.slice(0, 2).join("; ") : "Increased hiring velocity";

    candidateSignals.push({
      signalKey: `market_change:${industryName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
      type: "MARKET_CHANGE",
      severity: "HIGH",
      title: `${industryName} Hiring Demand Surging`,
      summary: `Market demand in ${industryName} is currently rated ${demandLevel} with a projected ${growthRate}% industry expansion. Explore live job opportunities now.`,
      confidence,
      impact,
      urgency,
      rawMetrics: {
        industryName,
        growthRate,
        demandLevel,
        marketOutlook,
        keyTrends,
        matchedJobs: topMatchedJobs,
      },
      evidence: [
        {
          label: "Industry Growth Rate",
          value: `+${growthRate}%`,
          details: `Annualized expansion index for ${industryName}.`,
        },
        {
          label: "Hiring Demand Level",
          value: demandLevel,
          details: `Recruiter active requisitions are at peak volume in this segment.`,
        },
        {
          label: "Market Outlook",
          value: marketOutlook,
          details: `Macroeconomic climate is strongly favorable for hiring.`,
        },
      ],
      recommendations: [
        `Explore live job openings in the Opportunities section: ${trendHighlight}.`,
        `Apply to high-match roles while hiring demand remains at peak levels.`,
        `Generate AI cold DMs for hiring managers on matching opportunities.`,
      ],
    });
  }

  return candidateSignals;
}

