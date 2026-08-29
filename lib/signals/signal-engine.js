// ============================================================================
// Career Signal Intelligence — Master Engine Orchestrator
// Coordinates detection, correlation, AI reasoning, scoring, and DB persistence
// ============================================================================

import { db } from "../prisma.js";
import { detectSkillGapSignals } from "./detectors/skill-gap-detector.js";
import { detectOpportunitySignals } from "./detectors/opportunity-detector.js";
import { detectPerformanceSignals } from "./detectors/performance-detector.js";
import { detectMarketChangeSignals } from "./detectors/market-change-detector.js";
import { correlateSignals } from "./correlation-engine.js";
import { generateSignalReasoning } from "./reasoning-engine.js";
import { scoreAndRankSignals } from "./scoring-engine.js";
import { generateSignalActions } from "./action-generator.js";

/**
 * Executes full signal intelligence evaluation for a candidate
 * 
 * @param {string} userId - User database ID
 * @param {Object} options - Options (e.g. forceRefresh)
 * @returns {Promise<Object>} { signals, summary }
 */
export async function runSignalEngine(userId, options = {}) {
  if (!userId) throw new Error("User ID is required for signal engine");

  // 1. Fetch full user context from database
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      resume: true,
      assessments: {
        orderBy: { createdAt: "asc" },
      },
      candidateApplications: {
        include: {
          job: true,
        },
        orderBy: { createdAt: "desc" },
      },
      candidateCalls: {
        orderBy: { createdAt: "desc" },
      },
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  // If user has no industry insight yet, try to load one
  let industryInsight = user.industryInsight;
  if (!industryInsight && user.industry) {
    industryInsight = await db.industryInsight.findUnique({
      where: { industry: user.industry },
    });
  }

  // Fetch active jobs in database for sampling market requirements
  const jobs = await db.job.findMany({
    take: 20,
    orderBy: { createdAt: "desc" },
  });

  // 2. Run all deterministic detectors in parallel
  const [skillGapSignals, opportunitySignals, performanceSignals, marketChangeSignals] =
    await Promise.all([
      detectSkillGapSignals({ user, industryInsight, jobs }),
      detectOpportunitySignals({ user, industryInsight }),
      detectPerformanceSignals({
        user,
        assessments: user.assessments || [],
        interviewCalls: user.candidateCalls || [],
      }),
      detectMarketChangeSignals({ user, industryInsight, jobs }),
    ]);

  const rawCandidateSignals = [
    ...skillGapSignals,
    ...opportunitySignals,
    ...performanceSignals,
    ...marketChangeSignals,
  ];

  // 3. Fetch existing database signals for this user
  const existingSignals = await db.careerSignal.findMany({
    where: { userId: user.id },
    include: {
      actions: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // 4. Correlate and deduplicate signals
  const { correlatedSignals, signalsToResolve } = correlateSignals({
    candidateSignals: rawCandidateSignals,
    existingSignals,
    userContext: { user, industryInsight, jobs },
  });

  // 5. Run AI Reasoning for signals that need hypothesis & action generation
  const enrichedSignals = await Promise.all(
    correlatedSignals.map(async (signal) => {
      // If signal already has a hypothesis and is not forced, reuse existing
      const existing = existingSignals.find((s) => s.signalKey === signal.signalKey);
      if (existing && existing.hypothesis && !options.forceRefresh) {
        return {
          ...signal,
          hypothesis: existing.hypothesis,
          actions: existing.actions || [],
        };
      }

      const reasoning = await generateSignalReasoning(signal, user);
      return {
        ...signal,
        hypothesis: reasoning.hypothesis,
        recommendations: reasoning.recommendations,
        actions: reasoning.actions,
      };
    })
  );

  // 6. Score and Rank all signals
  const rankedSignals = scoreAndRankSignals(enrichedSignals);

  // 7. Persist signals to PostgreSQL transactionally
  for (const signal of rankedSignals) {
    const existing = existingSignals.find((s) => s.signalKey === signal.signalKey);

    if (existing) {
      // Update existing active signal
      await db.careerSignal.update({
        where: { id: existing.id },
        data: {
          title: signal.title,
          summary: signal.summary,
          severity: signal.severity,
          confidence: signal.confidence,
          impact: signal.impact,
          urgency: signal.urgency,
          score: signal.score,
          hypothesis: signal.hypothesis,
          evidence: signal.evidence,
          recommendations: signal.recommendations,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new signal and its associated actions
      const createdSignal = await db.careerSignal.create({
        data: {
          userId: user.id,
          signalKey: signal.signalKey,
          type: signal.type,
          severity: signal.severity,
          title: signal.title,
          summary: signal.summary,
          confidence: signal.confidence,
          impact: signal.impact,
          urgency: signal.urgency,
          score: signal.score,
          hypothesis: signal.hypothesis,
          evidence: signal.evidence,
          recommendations: signal.recommendations,
          status: "ACTIVE",
          detectedAt: new Date(),
        },
      });

      // Generate and persist deep-linked actions
      const actionsToCreate = generateSignalActions(signal, user.id);
      if (actionsToCreate.length > 0) {
        await db.careerAction.createMany({
          data: actionsToCreate.map((action) => ({
            ...action,
            signalId: createdSignal.id,
          })),
        });
      }
    }
  }

  // Auto-resolve any satisfied signals
  for (const resolveItem of signalsToResolve) {
    await db.careerSignal.update({
      where: { id: resolveItem.id },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date(),
      },
    });
  }

  // 8. Fetch final updated signals list for return
  return await getUserSignalsWithSummary(user.id);
}

/**
 * Fetches stored signals with summary metrics for a candidate
 * 
 * @param {string} userId - User database ID
 * @returns {Promise<Object>} { signals, summary }
 */
export async function getUserSignalsWithSummary(userId) {
  const signals = await db.careerSignal.findMany({
    where: { userId },
    include: {
      actions: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: [{ status: "asc" }, { score: "desc" }, { createdAt: "desc" }],
  });

  const activeSignals = signals.filter((s) => s.status !== "RESOLVED" && s.status !== "EXPIRED");
  const resolvedSignals = signals.filter((s) => s.status === "RESOLVED");

  const totalActions = signals.flatMap((s) => s.actions || []);
  const completedActions = totalActions.filter((a) => a.status === "COMPLETED");

  const summary = {
    totalSignals: signals.length,
    activeSignals: activeSignals.length,
    resolvedSignals: resolvedSignals.length,
    critical: activeSignals.filter((s) => s.severity === "CRITICAL").length,
    high: activeSignals.filter((s) => s.severity === "HIGH").length,
    medium: activeSignals.filter((s) => s.severity === "MEDIUM").length,
    low: activeSignals.filter((s) => s.severity === "LOW").length,
    opportunities: activeSignals.filter((s) => s.type === "OPPORTUNITY").length,
    risks: activeSignals.filter((s) => s.type === "RISK" || (s.type === "SKILL_GAP" && s.severity === "CRITICAL")).length,
    performance: activeSignals.filter((s) => s.type === "PERFORMANCE" || s.type === "IMPROVEMENT").length,
    skillGaps: activeSignals.filter((s) => s.type === "SKILL_GAP").length,
    marketChanges: activeSignals.filter((s) => s.type === "MARKET_CHANGE").length,
    actionsTotal: totalActions.length,
    actionsCompleted: completedActions.length,
    completionRate: totalActions.length > 0 ? Math.round((completedActions.length / totalActions.length) * 100) : 0,
  };

  return {
    signals,
    summary,
  };
}
