"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getRecruiterDashboardStats() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");
  if (user.role !== "recruiter") throw new Error("Unauthorized: Recruiter access only");

  try {
    const totalCandidates = await db.user.count({
      where: { role: "candidate" },
    });

    const jobs = await db.job.findMany({
      where: { recruiterId: user.id },
      include: {
        applications: {
          select: {
            id: true,
            status: true,
            qualificationScore: true,
          },
        },
      },
    });

    const activeOpenings = jobs.length;
    const allApplications = jobs.flatMap((j) => j.applications);

    const recommendedCount = allApplications.filter(
      (a) => ["shortlisted", "interview_invited", "interview_accepted", "interview_completed", "human_round_scheduled"].includes(a.status)
    ).length;

    const selectedCount = allApplications.filter(
      (a) => a.status === "selected"
    ).length;

    const rejectedCount = allApplications.filter(
      (a) => a.status === "rejected"
    ).length;

    const pendingInterviews = allApplications.filter(
      (a) => ["interview_invited", "interview_accepted", "interview_completed", "human_round_scheduled"].includes(a.status)
    ).length;

    const scores = allApplications.map((a) => a.qualificationScore);
    const avgMatchScore =
      scores.length > 0
        ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
        : 0;

    // Status / Funnel Breakdown
    const statusBreakdown = {
      applied: allApplications.filter((a) => a.status === "applied").length,
      under_review: allApplications.filter((a) => a.status === "under_review").length,
      shortlisted: allApplications.filter((a) => a.status === "shortlisted").length,
      interview_invited: allApplications.filter((a) => a.status === "interview_invited").length,
      interview_accepted: allApplications.filter((a) => a.status === "interview_accepted").length,
      interview_completed: allApplications.filter((a) => a.status === "interview_completed").length,
      human_round_scheduled: allApplications.filter((a) => a.status === "human_round_scheduled").length,
      selected: selectedCount,
      rejected: rejectedCount,
      withdrawn: allApplications.filter((a) => a.status === "withdrawn").length,
    };

    // Score Distribution
    const scoreDistribution = {
      excellent: allApplications.filter((a) => a.qualificationScore >= 90).length,
      good: allApplications.filter((a) => a.qualificationScore >= 80 && a.qualificationScore < 90).length,
      fair: allApplications.filter((a) => a.qualificationScore >= 70 && a.qualificationScore < 80).length,
      poor: allApplications.filter((a) => a.qualificationScore < 70).length,
    };

    const activeJobsList = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      companyName: job.companyName,
      location: job.location,
      applicants: job.applications.length,
      avgScore: job.applications.length > 0
        ? Math.round(job.applications.reduce((sum, a) => sum + a.qualificationScore, 0) / job.applications.length)
        : 0,
    }));

    return {
      totalCandidates,
      recommendedCount,
      selectedCount,
      rejectedCount,
      pendingInterviews,
      activeOpenings,
      avgMatchScore,
      statusBreakdown,
      scoreDistribution,
      activeJobsList,
    };
  } catch (error) {
    console.error("Error fetching recruiter dashboard stats:", error.message);
    throw new Error("Failed to fetch dashboard stats");
  }
}

export async function searchCandidates({
  skills,
  experience,
  sortBy,
  page = 1,
  limit = 10,
} = {}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");
  if (user.role !== "recruiter") throw new Error("Unauthorized: Recruiter access only");

  try {
    let orderBy = { createdAt: "desc" };
    if (sortBy === "experience") {
      orderBy = { experience: "desc" };
    } else if (sortBy === "name") {
      orderBy = { name: "asc" };
    }

    // Fetch all candidates first for in-memory, case-insensitive filtering
    let candidates = await db.user.findMany({
      where: { role: "candidate" },
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
        skills: true,
        experience: true,
        bio: true,
        industry: true,
        resumeDriveUrl: true,
        videoResumeUrl: true,
      },
      orderBy,
    });

    // Case-insensitive skill matching
    if (skills && skills.length > 0) {
      const lowerSkills = skills.map((s) => s.toLowerCase());
      
      // Calculate match count for each candidate
      candidates = candidates.map((c) => {
        let matchCount = 0;
        if (c.skills) {
          matchCount = c.skills.filter((skill) =>
            lowerSkills.some(
              (lowerSkill) =>
                skill.toLowerCase().includes(lowerSkill) ||
                lowerSkill.includes(skill.toLowerCase())
            )
          ).length;
        }
        return { ...c, matchCount };
      });

      // Filter out candidates with 0 matches
      candidates = candidates.filter((c) => c.matchCount > 0);

      // Sort by matchCount descending (best match first)
      candidates.sort((a, b) => b.matchCount - a.matchCount);
    }

    // Experience matching
    if (experience !== undefined && experience !== null) {
      candidates = candidates.filter((c) => c.experience >= experience);
    }

    const totalCount = candidates.length;
    const totalPages = Math.ceil(totalCount / limit);
    const paginatedCandidates = candidates.slice((page - 1) * limit, page * limit);
    const hasMore = page < totalPages;

    return { candidates: paginatedCandidates, totalCount, page, totalPages, hasMore };
  } catch (error) {
    console.error("Error searching candidates:", error.message);
    throw new Error("Failed to search candidates");
  }
}

export async function runSupervityAgent(candidateId, jobDescription) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");
  if (user.role !== "recruiter") throw new Error("Unauthorized: Recruiter access only");

  try {
    const candidate = await db.user.findUnique({
      where: { id: candidateId },
      select: {
        id: true,
        name: true,
        skills: true,
        experience: true,
        bio: true,
        industry: true,
        resume: {
          select: { content: true },
        },
      },
    });

    if (!candidate) throw new Error("Candidate not found");

    const prompt = `
      You are an expert AI recruitment analyst (Supervity Agent). Analyze this candidate against the job description and return a detailed JSON evaluation.

      **Candidate Profile:**
      - Name: ${candidate.name || "Unknown"}
      - Skills: ${candidate.skills?.join(", ") || "None listed"}
      - Experience: ${candidate.experience || 0} years
      - Industry: ${candidate.industry || "Not specified"}
      - Bio: ${candidate.bio || "Not provided"}
      - Resume Content: ${candidate.resume?.content || "No resume on file"}

      **Job Description:**
      ${jobDescription}

      Return ONLY a valid JSON object in this exact format, no additional text:
      {
        "strengths": ["string"],
        "weaknesses": ["string"],
        "matchedSkills": ["string"],
        "missingSkills": ["string"],
        "recommendation": "string (hire / consider / pass)",
        "summary": "string (1-2 sentence candidate summary)",
        "scoreBreakdown": {
          "technicalAlignment": 0,
          "communicationFit": 0,
          "experienceFit": 0,
          "skillCoverage": 0,
          "confidenceScore": 0
        }
      }

      Each score in scoreBreakdown should be an integer from 0 to 100.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    const match = cleanedText.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Invalid AI response format");

    const report = JSON.parse(match[0]);

    const breakdown = report.scoreBreakdown;
    const aiMatchScore = Math.round(
      breakdown.technicalAlignment * 0.3 +
        breakdown.communicationFit * 0.1 +
        breakdown.experienceFit * 0.25 +
        breakdown.skillCoverage * 0.25 +
        breakdown.confidenceScore * 0.1
    );

    return { ...report, aiMatchScore };
  } catch (error) {
    console.error("Error running Supervity Agent:", error.message);
    throw new Error("Failed to run AI candidate evaluation");
  }
}

export async function sendInterviewInvitation({
  candidateId,
  companyName,
  jobTitle,
  jobDescription,
  recruiterMessage,
}) {
  console.log("[Server Action] sendInterviewInvitation CALLED:", { candidateId, companyName, jobTitle });
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");
  if (user.role !== "recruiter") throw new Error("Unauthorized: Recruiter access only");

  try {
    // Run Supervity Agent to get match report
    console.log("[Server Action] Running Supervity Agent evaluation...");
    const matchReport = await runSupervityAgent(candidateId, jobDescription);
    const { aiMatchScore, ...aiMatchReport } = matchReport;
    console.log("[Server Action] Supervity evaluation completed with score:", aiMatchScore);

    const interviewCall = await db.interviewCall.create({
      data: {
        candidateId,
        recruiterId: user.id,
        companyName: companyName || user.companyName || "Unknown Company",
        jobTitle,
        jobDescription,
        recruiterMessage: recruiterMessage || null,
        aiMatchReport,
        aiMatchScore,
        aiProcessingStatus: "completed",
        status: "pending",
        currentStage: "Resume Screening",
      },
    });

    console.log("[Server Action] Interview Call successfully created in DB:", interviewCall.id);
    return interviewCall;
  } catch (error) {
    console.error("[Server Action] Error sending interview invitation:", error.message);
    throw new Error("Failed to send interview invitation");
  }
}

export async function scheduleHumanInterview({
  callId,
  googleMeetLink,
  scheduledAt,
  humanMessage,
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");
  if (user.role !== "recruiter") throw new Error("Unauthorized: Recruiter access only");

  try {
    const call = await db.interviewCall.findUnique({
      where: { id: callId },
    });

    if (!call) throw new Error("Interview call not found");
    if (call.recruiterId !== user.id) throw new Error("Unauthorized: You do not own this interview call");

    const updatedCall = await db.interviewCall.update({
      where: { id: callId },
      data: {
        status: "scheduled",
        currentStage: "Human Interview",
        googleMeetLink,
        scheduledAt: new Date(scheduledAt),
        humanMessage: humanMessage || null,
      },
    });

    return updatedCall;
  } catch (error) {
    console.error("Error scheduling human interview:", error.message);
    throw new Error("Failed to schedule human interview");
  }
}

export async function rejectWithAIFeedback(callId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");
  if (user.role !== "recruiter") throw new Error("Unauthorized: Recruiter access only");

  try {
    const call = await db.interviewCall.findUnique({
      where: { id: callId },
      include: {
        candidate: {
          select: {
            name: true,
            skills: true,
            experience: true,
            industry: true,
          },
        },
      },
    });

    if (!call) throw new Error("Interview call not found");
    if (call.recruiterId !== user.id) throw new Error("Unauthorized: You do not own this interview call");

    const aiReport = call.aiMatchReport || {};

    const prompt = `
      You are a supportive career coach providing constructive rejection feedback to a candidate.

      **Candidate:** ${call.candidate.name || "Candidate"}
      **Applied for:** ${call.jobTitle} at ${call.companyName}
      **Their skills:** ${call.candidate.skills?.join(", ") || "Not listed"}
      **Experience:** ${call.candidate.experience || 0} years
      **AI Match Report Missing Skills:** ${aiReport.missingSkills?.join(", ") || "N/A"}
      **AI Weaknesses Found:** ${aiReport.weaknesses?.join(", ") || "N/A"}

      Write a supportive and constructive rejection feedback message that:
      1. Acknowledges their application effort
      2. Mentions specific skills they should improve
      3. Suggests concrete learning resources or areas to focus on
      4. Encourages them to apply again in the future

      Keep it professional, empathetic, and under 300 words.
    `;

    const result = await model.generateContent(prompt);
    const feedbackText = result.response.text().trim();

    const updatedCall = await db.interviewCall.update({
      where: { id: callId },
      data: {
        status: "rejected",
        candidateFeedback: feedbackText,
        currentStage: "Final Decision",
      },
    });

    return updatedCall;
  } catch (error) {
    console.error("Error rejecting with AI feedback:", error.message);
    throw new Error("Failed to reject candidate with AI feedback");
  }
}

export async function makeFinalSelection(callId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");
  if (user.role !== "recruiter") throw new Error("Unauthorized: Recruiter access only");

  try {
    const call = await db.interviewCall.findUnique({
      where: { id: callId },
    });

    if (!call) throw new Error("Interview call not found");
    if (call.recruiterId !== user.id) throw new Error("Unauthorized: You do not own this interview call");

    const updatedCall = await db.interviewCall.update({
      where: { id: callId },
      data: {
        status: "selected",
        currentStage: "Final Decision",
      },
    });

    return updatedCall;
  } catch (error) {
    console.error("Error making final selection:", error.message);
    throw new Error("Failed to make final selection");
  }
}

export async function toggleSaveCandidate({ candidateId }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");
  if (user.role !== "recruiter") throw new Error("Unauthorized: Recruiter access only");

  try {
    const existing = await db.savedCandidate.findUnique({
      where: {
        recruiterId_candidateId: {
          recruiterId: user.id,
          candidateId,
        },
      },
    });

    if (existing) {
      await db.savedCandidate.delete({
        where: { id: existing.id },
      });
      return { saved: false };
    }

    await db.savedCandidate.create({
      data: {
        recruiterId: user.id,
        candidateId,
      },
    });

    return { saved: true };
  } catch (error) {
    console.error("Error toggling saved candidate:", error.message);
    throw new Error("Failed to toggle saved candidate");
  }
}

export async function getSavedCandidates() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");
  if (user.role !== "recruiter") throw new Error("Unauthorized: Recruiter access only");

  try {
    const savedCandidates = await db.savedCandidate.findMany({
      where: { recruiterId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // Fetch candidate user data for each saved candidate
    const candidateIds = savedCandidates.map((sc) => sc.candidateId);

    const candidates = await db.user.findMany({
      where: { id: { in: candidateIds } },
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
        skills: true,
        experience: true,
        bio: true,
        industry: true,
        resumeDriveUrl: true,
        videoResumeUrl: true,
      },
    });

    // Merge saved info with candidate data
    return savedCandidates.map((sc) => ({
      savedId: sc.id,
      savedAt: sc.createdAt,
      candidate: candidates.find((c) => c.id === sc.candidateId) || null,
    }));
  } catch (error) {
    console.error("Error fetching saved candidates:", error.message);
    throw new Error("Failed to fetch saved candidates");
  }
}

export async function selectCandidate({ callId }) {
  return makeFinalSelection(callId);
}

export async function rejectCandidate({ callId, feedback }) {
  if (feedback) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");
    if (user.role !== "recruiter") throw new Error("Unauthorized: Recruiter access only");

    const call = await db.interviewCall.findUnique({
      where: { id: callId },
    });

    if (!call) throw new Error("Interview call not found");
    if (call.recruiterId !== user.id) throw new Error("Unauthorized: You do not own this interview call");

    return await db.interviewCall.update({
      where: { id: callId },
      data: {
        status: "rejected",
        candidateFeedback: feedback,
        currentStage: "Final Decision",
      },
    });
  } else {
    return rejectWithAIFeedback(callId);
  }
}

export async function getRecruiterCalls() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");
  if (user.role !== "recruiter") throw new Error("Unauthorized: Recruiter access only");

  try {
    const calls = await db.interviewCall.findMany({
      where: { recruiterId: user.id },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
            skills: true,
            experience: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return calls;
  } catch (error) {
    console.error("Error fetching recruiter calls:", error.message);
    throw new Error("Failed to fetch recruiter interview calls");
  }
}

export async function extractSkillsFromJD(jobDescription) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user || user.role !== "recruiter") {
    throw new Error("Unauthorized: Recruiter access only");
  }

  try {
    const prompt = `
      Extract a list of core skills and technologies from the following job description.
      Return ONLY a JSON array of strings, where each string is a skill.
      Example: ["React", "Node.js", "Python", "Communication"]

      Job Description:
      ${jobDescription}
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    const match = cleanedText.match(/\[[\s\S]*\]/);
    if (match) {
      return JSON.parse(match[0]);
    }
    return [];
  } catch (error) {
    console.error("Error extracting skills:", error.message);
    throw new Error("Failed to extract skills");
  }
}
