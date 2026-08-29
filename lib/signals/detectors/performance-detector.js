// ============================================================================
// Performance Detector — Deterministic Signal Intelligence
// Analyzes historical assessment quizzes and interview calls for trends
// ============================================================================

/**
 * Detects interview and technical performance signals from historical assessments
 * 
 * @param {Object} context
 * @param {Object} context.user - Candidate with assessments and interview calls
 * @param {Array} context.assessments - Historical quiz assessments
 * @param {Array} context.interviewCalls - Historical mock & recruiter interview calls
 * @returns {Array<Object>} List of candidate performance signals
 */
export async function detectPerformanceSignals({ user, assessments = [], interviewCalls = [] }) {
  const candidateSignals = [];
  if (!user) return candidateSignals;

  // 1. Gather all scores chronologically
  const quizScores = assessments.map((a) => ({
    date: new Date(a.createdAt),
    score: a.quizScore,
    category: a.category || "Technical",
    tip: a.improvementTip,
    type: "quiz",
  }));

  const interviewScores = interviewCalls
    .filter((call) => call.technicalScore != null || call.aiMatchScore != null)
    .map((call) => ({
      date: new Date(call.createdAt),
      score: call.technicalScore || call.aiMatchScore,
      category: "Live / Virtual Interview",
      type: "interview",
    }));

  const allAttempts = [...quizScores, ...interviewScores].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  const totalAttempts = allAttempts.length;

  // Need at least 2 assessments to identify a pattern or trend
  if (totalAttempts < 2) {
    return candidateSignals;
  }

  // 2. Compute statistical aggregates
  const scores = allAttempts.map((a) => a.score);
  const averageScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
  const latestScore = scores[scores.length - 1];
  const firstScore = scores[0];

  // Calculate trend slope over recent attempts
  const recentWindow = scores.slice(-4);
  const recentAvg = Math.round(recentWindow.reduce((sum, s) => sum + s, 0) / recentWindow.length);
  const initialWindow = scores.slice(0, Math.min(2, scores.length));
  const initialAvg = Math.round(initialWindow.reduce((sum, s) => sum + s, 0) / initialWindow.length);
  const delta = recentAvg - initialAvg;

  // 3. Scenario A: Strong Improvement Detected (+15% or higher)
  if (delta >= 15 && latestScore >= 70) {
    const confidence = Math.min(85 + Math.round(totalAttempts * 2), 95);
    const impact = 80;
    const urgency = 50;

    candidateSignals.push({
      signalKey: "perf:technical_improvement",
      type: "IMPROVEMENT",
      severity: "MEDIUM",
      title: "Technical Interview Surge Detected",
      summary: `Your technical evaluation scores have surged by +${delta}% over your last ${scores.length} attempts (now averaging ${recentAvg}%).`,
      confidence,
      impact,
      urgency,
      rawMetrics: {
        totalAttempts,
        averageScore,
        recentAvg,
        initialAvg,
        delta,
        latestScore,
      },
      evidence: [
        {
          label: "Performance Delta",
          value: `+${delta}%`,
          details: `Average increased from ${initialAvg}% to ${recentAvg}% across ${totalAttempts} evaluations.`,
        },
        {
          label: "Latest Evaluation",
          value: `${latestScore}%`,
          details: `Your most recent assessment demonstrated significant technical retention.`,
        },
        {
          label: "Assessment Consistency",
          value: `${totalAttempts} Completed`,
          details: `Verified across ${totalAttempts} recorded quiz and mock interview sessions.`,
        },
      ],
      recommendations: [
        "Capitalize on your interview momentum by applying to target roles.",
        "Take an advanced simulation test to benchmark your senior-level readiness.",
        "Highlight your verified technical skills in your latest resume update.",
      ],
    });
  }

  // 4. Scenario B: Persistent Weakness Detected (Average < 55% or flat low trend)
  if (averageScore < 60 || (recentAvg < 60 && totalAttempts >= 2)) {
    const confidence = Math.min(82 + Math.round(totalAttempts * 3), 94);
    const impact = 85;
    const urgency = 80;

    candidateSignals.push({
      signalKey: "perf:technical_weakness",
      type: "PERFORMANCE",
      severity: "HIGH",
      title: "Persistent Technical Assessment Weakness",
      summary: `Your technical quiz scores average ${averageScore}% across ${totalAttempts} attempts, indicating recurring knowledge gaps in core concepts.`,
      confidence,
      impact,
      urgency,
      rawMetrics: {
        totalAttempts,
        averageScore,
        recentAvg,
        initialAvg,
        delta,
        latestScore,
      },
      evidence: [
        {
          label: "Historical Average",
          value: `${averageScore}%`,
          details: `Average score across ${totalAttempts} assessments is below the 75% interview qualification threshold.`,
        },
        {
          label: "Trend Trajectory",
          value: delta <= 5 ? "Flat / Stagnant" : `Slow (+${delta}%)`,
          details: `Recent performance is not demonstrating sufficient upward velocity.`,
        },
        {
          label: "Attempts Logged",
          value: `${totalAttempts} Sessions`,
          details: `Evaluated over multiple independent technical assessment rounds.`,
        },
      ],
      recommendations: [
        "Review specific question explanations in the Interview Prep module.",
        "Focus on system design and architectural principles for your domain.",
        "Practice focused 10-question technical drills before live interviews.",
      ],
    });
  }

  return candidateSignals;
}
