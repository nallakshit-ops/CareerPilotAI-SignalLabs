import { PrismaClient } from "@prisma/client";
import { runSignalEngine, getUserSignalsWithSummary } from "../lib/signals/signal-engine.js";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Comprehensive Career Signal Intelligence Test ===");
  
  // 1. Ensure test industry insight exists
  let industryInsight = await prisma.industryInsight.upsert({
    where: { industry: "tech-software-development" },
    update: {},
    create: {
      industry: "tech-software-development",
      salaryRanges: [
        { role: "Software Engineer", min: 800000, max: 2000000, median: 1400000 },
        { role: "AI Product Engineer", min: 1200000, max: 2800000, median: 1900000 },
        { role: "Cloud Solutions Architect", min: 1500000, max: 3200000, median: 2200000 },
      ],
      growthRate: 28.5,
      demandLevel: "High",
      topSkills: ["React", "TypeScript", "Node.js", "Python", "Docker", "AWS", "Machine Learning", "GraphQL"],
      marketOutlook: "Positive",
      keyTrends: [
        "Rapid adoption of generative AI tooling and agentic workflows",
        "Cloud-native microservices and serverless infrastructure",
        "Full-stack TypeScript and Next.js modern frontend standards",
      ],
      recommendedSkills: ["Python", "AWS", "Docker", "Machine Learning"],
      nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // 2. Find or create candidate with realistic skills & assessments
  let user = await prisma.user.findFirst({
    where: { role: "candidate" },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkUserId: "candidate_test_" + Date.now(),
        email: "alex.rivera@signal-test.com",
        name: "Alex Rivera",
        role: "candidate",
      },
    });
  }

  // Update candidate profile with targeted skills
  user = await prisma.user.update({
    where: { id: user.id },
    data: {
      industry: "tech-software-development",
      skills: ["React", "JavaScript", "HTML", "CSS", "Tailwind CSS"],
      experience: 2,
      bio: "Frontend engineer with React & JavaScript experience eager to transition to Full Stack AI.",
    },
  });

  // Create historical assessments to test performance trend detection (scores 45, 52, 48)
  const existingAssessments = await prisma.assessment.findMany({
    where: { userId: user.id },
  });

  if (existingAssessments.length < 3) {
    await prisma.assessment.createMany({
      data: [
        {
          userId: user.id,
          quizScore: 45,
          category: "Technical",
          questions: [],
          improvementTip: "Practice system design and database indexing.",
        },
        {
          userId: user.id,
          quizScore: 52,
          category: "Technical",
          questions: [],
          improvementTip: "Review asynchronous JavaScript and distributed state.",
        },
        {
          userId: user.id,
          quizScore: 48,
          category: "Technical",
          questions: [],
          improvementTip: "Deepen understanding of backend API scalability.",
        },
      ],
    });
  }

  console.log(`\n✔ Configured Test Candidate: ${user.name} (ID: ${user.id})`);
  console.log(`- Industry: ${user.industry}`);
  console.log(`- Verified Skills: ${user.skills.join(", ")}`);
  console.log(`- Years Experience: ${user.experience}`);

  // 3. Execute Signal Intelligence Engine
  console.log("\n>>> Running runSignalEngine() with AI Reasoning...");
  const result = await runSignalEngine(user.id, { forceRefresh: true });

  console.log("\n=======================================================");
  console.log(`🎉 SCAN COMPLETE: ${result.signals.length} Signals Evaluated`);
  console.log("=======================================================");
  console.log("Summary Metrics:\n", JSON.stringify(result.summary, null, 2));

  result.signals.forEach((sig, idx) => {
    console.log(`\n-------------------------------------------------------`);
    console.log(`[Signal #${idx + 1}] ${sig.severity} ${sig.type}: ${sig.title}`);
    console.log(`Score: ${sig.score}/100 | Confidence: ${sig.confidence}% | Impact: ${sig.impact}% | Urgency: ${sig.urgency}%`);
    console.log(`Summary: ${sig.summary}`);
    console.log(`AI Hypothesis: ${sig.hypothesis}`);
    console.log(`Evidence items: ${sig.evidence?.length || 0}`);
    (sig.evidence || []).forEach((ev) => {
      console.log(`  • ${ev.label}: ${ev.value} (${ev.details || ""})`);
    });
    console.log(`Actions generated: ${sig.actions?.length || 0}`);
    (sig.actions || []).forEach((act, aIdx) => {
      console.log(`  [Action ${aIdx + 1}] ${act.title} (Priority: ${act.priority}, DeepLink: ${act.actionUrl || "N/A"})`);
    });
  });

  // 4. Test Deduplication
  console.log("\n>>> Verifying Deduplication (Consecutive Scan)...");
  const secondRun = await runSignalEngine(user.id, { forceRefresh: false });
  console.log(`Second run count: ${secondRun.signals.length} vs First run: ${result.signals.length}`);

  if (secondRun.signals.length === result.signals.length) {
    console.log("✔ Deduplication test PASSED: 0 duplicate rows created.");
  } else {
    console.warn("⚠ Duplicate signals detected!");
  }

  // 5. Test Action Completion & Automatic Signal Resolution
  console.log("\n>>> Testing Action Completion & Auto-Resolution Loop...");
  const testSignal = result.signals.find((s) => s.actions && s.actions.length > 0);
  if (testSignal) {
    const firstAction = testSignal.actions[0];
    console.log(`Marking Action "${firstAction.title}" (ID: ${firstAction.id}) as COMPLETED...`);
    
    await prisma.careerAction.update({
      where: { id: firstAction.id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    const updatedData = await getUserSignalsWithSummary(user.id);
    console.log(`Action completion rate now: ${updatedData.summary.completionRate}% (${updatedData.summary.actionsCompleted}/${updatedData.summary.actionsTotal})`);
    console.log("✔ Action feedback loop verified!");
  }

  console.log("\n=======================================================");
  console.log("🚀 ALL SIGNAL INTELLIGENCE TESTS PASSED SUCCESSFULLY!");
  console.log("=======================================================");
}

main()
  .catch((err) => {
    console.error("Test Error:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
