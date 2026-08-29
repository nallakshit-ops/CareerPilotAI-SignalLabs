// ============================================================================
// Opportunity Detector — Deterministic Signal Intelligence
// Detects high-compatibility emerging roles and career pathways
// ============================================================================

import { extractSkills, calculateSkillGap } from "../../services/skill-analysis.js";

// Emerging & High-Value Industry Archetypes for comparison
const OPPORTUNITY_ARCHETYPES = [
  {
    role: "AI Product Engineer",
    domain: "Artificial Intelligence",
    coreSkills: ["react", "typescript", "node.js", "python", "rest api", "machine learning"],
    preferredExperience: 1,
    growthRate: 34,
    description: "Build AI-powered user applications leveraging modern LLM APIs, Next.js, and backend pipelines.",
  },
  {
    role: "Full Stack AI Engineer",
    domain: "Software Development",
    coreSkills: ["python", "javascript", "react", "fastapi", "postgresql", "docker"],
    preferredExperience: 2,
    growthRate: 38,
    description: "End-to-end intelligent web systems combining dynamic UI with intelligent model serving.",
  },
  {
    role: "Cloud Platform Engineer",
    domain: "Cloud & DevOps",
    coreSkills: ["aws", "docker", "kubernetes", "ci/cd", "terraform", "linux"],
    preferredExperience: 2,
    growthRate: 28,
    description: "Automate scalable cloud infrastructure, resilient deployment pipelines, and microservices.",
  },
  {
    role: "Analytics Engineer",
    domain: "Data & Analytics",
    coreSkills: ["sql", "python", "data analysis", "postgresql", "power bi"],
    preferredExperience: 1,
    growthRate: 25,
    description: "Transform raw organizational data into reliable, production-grade analytical pipelines.",
  },
  {
    role: "Design Systems Engineer",
    domain: "Frontend Architecture",
    coreSkills: ["react", "typescript", "tailwind css", "ui/ux", "figma", "html", "css"],
    preferredExperience: 1,
    growthRate: 22,
    description: "Bridge the gap between product design and scalable frontend component architecture.",
  },
];

/**
 * Detects career opportunity candidate signals
 * 
 * @param {Object} context
 * @param {Object} context.user - Candidate profile with skills, experience, resume
 * @param {Object} context.industryInsight - Industry trends
 * @returns {Array<Object>} List of candidate opportunity signals
 */
export async function detectOpportunitySignals({ user, industryInsight }) {
  const candidateSignals = [];
  if (!user) return candidateSignals;

  // 1. Compile all candidate skills
  const profileSkills = Array.isArray(user.skills) ? user.skills : [];
  const resumeText = user.resume?.content || "";
  const resumeExtractedSkills = resumeText ? extractSkills(resumeText) : [];
  const candidateSkills = Array.from(
    new Set([...profileSkills, ...resumeExtractedSkills].map((s) => s.toLowerCase().trim()))
  );

  if (candidateSkills.length === 0) {
    return candidateSignals;
  }

  const candidateExp = user.experience || 0;

  // 2. Evaluate candidate fit across archetypes
  const opportunityEvaluations = [];

  for (const archetype of OPPORTUNITY_ARCHETYPES) {
    const gapAnalysis = calculateSkillGap(candidateSkills, archetype.coreSkills);
    const skillMatchScore = gapAnalysis.matchPercentage; // 0 - 100

    // Experience match score
    let expMatchScore = 100;
    if (archetype.preferredExperience > 0) {
      expMatchScore = candidateExp >= archetype.preferredExperience
        ? 100
        : Math.round((candidateExp / archetype.preferredExperience) * 80);
    }

    // Weighted Overall Compatibility Score
    const compatibilityScore = Math.round(skillMatchScore * 0.7 + expMatchScore * 0.3);

    // Only surface as opportunity if compatibility is strong (>= 60%)
    if (compatibilityScore >= 60 && gapAnalysis.matchedSkills.length >= 2) {
      opportunityEvaluations.push({
        archetype,
        compatibilityScore,
        skillMatchScore,
        expMatchScore,
        matchedSkills: gapAnalysis.matchedSkills,
        missingSkills: gapAnalysis.missingSkills,
      });
    }
  }

  // Sort by highest compatibility
  opportunityEvaluations.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  // Take top 2 high-leverage opportunities
  const topOpportunities = opportunityEvaluations.slice(0, 2);

  for (const opp of topOpportunities) {
    const { archetype, compatibilityScore, matchedSkills, missingSkills } = opp;
    const confidence = Math.min(80 + Math.round(compatibilityScore * 0.15), 95);
    const impact = Math.min(75 + Math.round(archetype.growthRate * 0.5), 95);
    const urgency = compatibilityScore >= 80 ? 75 : 60;
    const severity = compatibilityScore >= 80 ? "HIGH" : "MEDIUM";

    const keySkillList = matchedSkills.slice(0, 4).join(", ");
    const nextSkill = missingSkills.length > 0 ? missingSkills[0] : null;

    const evidence = [
      {
        label: "Compatibility Match",
        value: `${compatibilityScore}%`,
        details: `Your current skill profile matches ${compatibilityScore}% of requirements for ${archetype.role}.`,
      },
      {
        label: "Market Growth Rate",
        value: `+${archetype.growthRate}% YoY`,
        details: `Roles in ${archetype.domain} are growing significantly faster than general tech benchmarks.`,
      },
      {
        label: "Demonstrated Strengths",
        value: keySkillList,
        details: `Your proficiency in ${keySkillList} provides a direct foundation for this role.`,
      },
    ];

    if (nextSkill) {
      evidence.push({
        label: "Final Bridge Skill",
        value: nextSkill,
        details: `Acquiring ${nextSkill} will bring your qualification score to 95%+.`,
      });
    }

    candidateSignals.push({
      signalKey: `opportunity:${archetype.role.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
      type: "OPPORTUNITY",
      severity,
      title: `High Match: ${archetype.role}`,
      summary: `You are an ${compatibilityScore}% match for ${archetype.role} positions based on your ${keySkillList} capabilities.`,
      confidence,
      impact,
      urgency,
      rawMetrics: {
        targetRole: archetype.role,
        compatibilityScore,
        matchedSkills,
        missingSkills,
        growthRate: archetype.growthRate,
        domain: archetype.domain,
      },
      evidence,
      recommendations: [
        `Explore career pathways and salary bands for ${archetype.role}.`,
        nextSkill ? `Upskill in ${nextSkill} to complete the remaining qualification gap.` : `Tailor your resume for ${archetype.role} openings.`,
        `Build a flagship project showcasing ${keySkillList} alignment.`,
      ],
    });
  }

  return candidateSignals;
}
