"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { calculateSkillGap } from "@/lib/skill-analysis";

// Helper to secure role and check active database user
async function getAuthenticatedUser(role) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      resume: true,
    }
  });

  if (!user) throw new Error("User not found");
  if (role && user.role !== role) {
    throw new Error(`Unauthorized: Requires ${role} access`);
  }

  return user;
}

// 1. Create a Job posting (Recruiter only)
export async function createJob(payload) {
  const user = await getAuthenticatedUser("recruiter");

  const {
    title,
    companyName,
    description,
    requiredSkills,
    minExperience,
    employmentType,
    location,
    qualificationThreshold,
  } = payload;

  try {
    const job = await db.job.create({
      data: {
        recruiterId: user.id,
        title,
        companyName: companyName || user.companyName || "Unknown Company",
        description,
        requiredSkills: requiredSkills || [],
        minExperience: parseInt(minExperience) || 0,
        employmentType: employmentType || "Full-time",
        location: location || "Remote",
        qualificationThreshold: parseFloat(qualificationThreshold) || 75.0,
      },
    });

    return { success: true, job };
  } catch (error) {
    console.error("Error creating job:", error);
    throw new Error("Failed to create job posting");
  }
}

// 2. Fetch and Search Job postings (For candidates to browse and apply)
export async function getJobs(filters = {}) {
  const { search, location, type, experience, region } = filters;
  const { userId } = await auth();

  // Try to find if candidate applied
  let dbUser = null;
  if (userId) {
    dbUser = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
  }

  try {
    // Basic search filtering
    let where = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (location && location !== "all") {
      if (location === "remote") {
        where.location = { contains: "remote", mode: "insensitive" };
      } else if (location === "hybrid") {
        where.location = { contains: "hybrid", mode: "insensitive" };
      } else if (location === "onsite") {
        where.NOT = [
          { location: { contains: "remote", mode: "insensitive" } },
          { location: { contains: "hybrid", mode: "insensitive" } },
        ];
      } else {
        where.location = { contains: location, mode: "insensitive" };
      }
    }

    if (type && type !== "all") {
      where.employmentType = { contains: type, mode: "insensitive" };
    }

    if (experience && experience !== "all") {
      if (experience === "intern") {
        where.minExperience = 0;
      } else if (experience === "entry") {
        where.minExperience = { lte: 2 };
      } else if (experience === "mid") {
        where.minExperience = { gte: 2, lte: 5 };
      } else if (experience === "senior") {
        where.minExperience = { gte: 5 };
      }
    }

    // Region lookup
    if (region && region !== "remote") {
      where.location = { contains: region, mode: "insensitive" };
    }

    const jobs = await db.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        applications: {
          select: {
            id: true,
            candidateId: true,
            status: true,
            qualificationScore: true,
          },
        },
      },
    });

    // Map jobs to inject alreadyApplied status for the current candidate
    const jobsWithAppliedStatus = jobs.map((job) => {
      const application = dbUser
        ? job.applications.find((app) => app.candidateId === dbUser.id)
        : null;

      return {
        ...job,
        alreadyApplied: !!application,
        applicationStatus: application ? application.status : null,
        applicationScore: application ? application.qualificationScore : null,
        applicationsCount: job.applications.length,
      };
    });

    return { success: true, jobs: jobsWithAppliedStatus };
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw new Error("Failed to fetch jobs");
  }
}

// 3. Get Specific Job Details (With applicant stats for recruiters)
export async function getJobDetails(jobId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  try {
    const job = await db.job.findUnique({
      where: { id: jobId },
      include: {
        applications: {
          include: {
            candidate: {
              select: {
                id: true,
                name: true,
                email: true,
                imageUrl: true,
                skills: true,
                experience: true,
                bio: true,
                resumeDriveUrl: true,
                videoResumeUrl: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!job) throw new Error("Job not found");

    const applicationIds = job.applications.map((app) => app.id);
    const interviewCalls = applicationIds.length
      ? await db.interviewCall.findMany({
          where: {
            jobId,
            applicationId: { in: applicationIds },
          },
          orderBy: { createdAt: "desc" },
        })
      : [];

    const interviewCallByApplicationId = new Map();
    for (const call of interviewCalls) {
      if (call.applicationId && !interviewCallByApplicationId.has(call.applicationId)) {
        interviewCallByApplicationId.set(call.applicationId, call);
      }
    }

    const applicationsWithCalls = job.applications.map((app) => ({
      ...app,
      interviewCall: interviewCallByApplicationId.get(app.id) || null,
    }));

    // Add per-job analytics
    const totalApps = job.applications.length;
    const shortlistedApps = job.applications.filter((a) => a.status === "shortlisted" || a.status === "interview_invited" || a.status === "interview_accepted" || a.status === "interview_completed" || a.status === "human_round_scheduled" || a.status === "selected").length;
    const rejectedApps = job.applications.filter((a) => a.status === "rejected").length;
    
    const scores = job.applications.map((a) => a.qualificationScore);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) : 0;
    
    const conversionRate = totalApps > 0 ? Math.round((shortlistedApps / totalApps) * 100) : 0;
    const rejectionRate = totalApps > 0 ? Math.round((rejectedApps / totalApps) * 100) : 0;

    const analytics = {
      totalApplications: totalApps,
      shortlistRate: conversionRate,
      rejectionRate,
      averageScore: avgScore,
      conversionRate,
    };

    return {
      success: true,
      job: { ...job, applications: applicationsWithCalls },
      analytics,
      isOwner: job.recruiterId === user.id,
    };
  } catch (error) {
    console.error("Error fetching job details:", error);
    throw new Error("Failed to fetch job details");
  }
}

// 4. Candidate Applies to a Job (Deterministic Matching Engine)
export async function applyToJob({ jobId }) {
  console.log("[Server Action] applyToJob CALLED for jobId:", jobId);
  const user = await getAuthenticatedUser("candidate");

  try {
    // Prevent duplicate applications
    const existing = await db.jobApplication.findUnique({
      where: {
        jobId_candidateId: {
          jobId,
          candidateId: user.id,
        },
      },
    });
    if (existing) {
      throw new Error("You have already applied to this job");
    }

    const job = await db.job.findUnique({
      where: { id: jobId },
    });
    if (!job) throw new Error("Job not found");

    // 1. Compute Deterministic screening scores
    // A. Skill Matching (60% weight)
    console.log("[Server Action] Matching candidate skills against job required skills...");
    const candidateSkills = user.skills || [];
    const requiredSkills = job.requiredSkills || [];
    const skillGap = calculateSkillGap(candidateSkills, requiredSkills);
    
    const skillScore = skillGap.matchPercentage; // 0 to 100

    // B. Experience Matching (40% weight)
    const minExp = job.minExperience;
    const candExp = user.experience || 0;
    let experienceScore = 100;

    if (minExp > 0) {
      if (candExp >= minExp) {
        experienceScore = 100;
      } else {
        experienceScore = Math.round((candExp / minExp) * 100);
      }
    }

    // C. Profile Score (average check)
    const profileScore = Math.round(skillScore * 0.7 + experienceScore * 0.3);

    // Final Weighted Score
    const finalScore = Math.round(skillScore * 0.6 + experienceScore * 0.4);

    // Deterministic status lifecycle
    const isQualified = finalScore >= job.qualificationThreshold;
    const status = isQualified ? "shortlisted" : "rejected";

    // Rejection feedback compiling deterministically
    let rejectionFeedback = null;
    if (!isQualified) {
      const suggestions = [];
      if (candExp < minExp) {
        suggestions.push(`Acquire ${minExp - candExp} more years of hands-on experience in this domain.`);
      }
      skillGap.missingSkills.forEach((skill) => {
        suggestions.push(`Enhance your technical expertise in ${skill} by completing structured courses or building projects.`);
      });

      rejectionFeedback = {
        missingSkills: skillGap.missingSkills,
        improvementSuggestions: suggestions.length > 0 ? suggestions : ["Learn backend scalability and deployment pipelines."],
      };
    }

    // 2. Save Snapshots (Prevents historical data drift if candidate changes profile later)
    const resumeSnapshot = user.resume?.content || null;
    const skillsSnapshot = user.skills || [];
    const experienceSnapshot = user.experience || 0;

    const application = await db.jobApplication.create({
      data: {
        jobId,
        candidateId: user.id,
        resumeSnapshot,
        skillsSnapshot,
        experienceSnapshot,
        qualificationScore: finalScore,
        scoreBreakdown: {
          skillScore,
          experienceScore,
          profileScore,
        },
        status,
        rejectionFeedback,
      },
    });

    console.log("[Server Action] Application successfully created. Status:", status, "Score:", finalScore);
    
    // Notification hook placeholder
    triggerNotificationPlaceholder("application_received", {
      candidateId: user.id,
      jobId,
      status,
      score: finalScore,
    });

    return { success: true, application };
  } catch (error) {
    console.error("[Server Action] Error applying to job:", error.message);
    throw new Error(error.message || "Failed to submit job application");
  }
}

// 5. Candidate Withdraws Application
export async function withdrawApplication({ applicationId }) {
  const user = await getAuthenticatedUser("candidate");

  try {
    const app = await db.jobApplication.findUnique({
      where: { id: applicationId },
    });

    if (!app) throw new Error("Application not found");
    if (app.candidateId !== user.id) {
      throw new Error("Unauthorized: You do not own this application");
    }

    if (app.status === "selected" || app.status === "interview_invited" || app.status === "human_round_scheduled") {
      throw new Error("Cannot withdraw application once interview stages have commenced");
    }

    const updated = await db.jobApplication.update({
      where: { id: applicationId },
      data: { status: "withdrawn" },
    });

    triggerNotificationPlaceholder("application_withdrawn", {
      candidateId: user.id,
      applicationId,
    });

    return { success: true, application: updated };
  } catch (error) {
    console.error("Error withdrawing application:", error.message);
    throw new Error(error.message || "Failed to withdraw application");
  }
}

// 6. Recruiter Updates Application Status
export async function updateApplicationStatus({ applicationId, status, recruiterNotes }) {
  const user = await getAuthenticatedUser("recruiter");

  try {
    const app = await db.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        candidate: true,
      },
    });

    if (!app) throw new Error("Application not found");
    if (app.job.recruiterId !== user.id) {
      throw new Error("Unauthorized: You do not own the job posting for this application");
    }

    const updated = await db.jobApplication.update({
      where: { id: applicationId },
      data: {
        status,
        recruiterNotes: recruiterNotes !== undefined ? recruiterNotes : app.recruiterNotes,
      },
    });

    // Auto-create or link InterviewCall if moved to interview_invited
    if (status === "interview_invited") {
      const existingCall = await db.interviewCall.findFirst({
        where: {
          candidateId: app.candidateId,
          recruiterId: user.id,
          jobId: app.jobId,
        },
      });

      if (!existingCall) {
        // Pre-create the Virtual Interview invitation
        await db.interviewCall.create({
          data: {
            candidateId: app.candidateId,
            recruiterId: user.id,
            jobId: app.jobId,
            applicationId: app.id,
            companyName: app.job.companyName,
            jobTitle: app.job.title,
            jobDescription: app.job.description,
            recruiterMessage: "We reviewed your application and would like to invite you for a virtual pre-screening interview!",
            status: "pending",
            currentStage: "Resume Screening",
          },
        });
      }
    }

    triggerNotificationPlaceholder("status_updated", {
      candidateId: app.candidateId,
      jobId: app.jobId,
      status,
    });

    return { success: true, application: updated };
  } catch (error) {
    console.error("Error updating application status:", error.message);
    throw new Error(error.message || "Failed to update application status");
  }
}

// 7. Recruiter retrieves their posted jobs
export async function getRecruiterJobs() {
  const user = await getAuthenticatedUser("recruiter");

  try {
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
      orderBy: { createdAt: "desc" },
    });

    return jobs.map((job) => {
      const totalApps = job.applications.length;
      const shortlistedApps = job.applications.filter((a) => a.status === "shortlisted" || a.status === "interview_invited" || a.status === "interview_accepted" || a.status === "interview_completed" || a.status === "human_round_scheduled" || a.status === "selected").length;
      const rejectedApps = job.applications.filter((a) => a.status === "rejected").length;
      const scores = job.applications.map((a) => a.qualificationScore);
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) : 0;

      return {
        ...job,
        totalApplications: totalApps,
        shortlistRate: totalApps > 0 ? Math.round((shortlistedApps / totalApps) * 100) : 0,
        rejectionRate: totalApps > 0 ? Math.round((rejectedApps / totalApps) * 100) : 0,
        averageScore: avgScore,
      };
    });
  } catch (error) {
    console.error("Error fetching recruiter jobs:", error);
    throw new Error("Failed to fetch jobs");
  }
}

// 8. Candidate fetches their own applications
export async function getCandidateApplications() {
  const user = await getAuthenticatedUser("candidate");

  try {
    const applications = await db.jobApplication.findMany({
      where: { candidateId: user.id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            companyName: true,
            location: true,
            employmentType: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return applications;
  } catch (error) {
    console.error("Error fetching candidate applications:", error);
    throw new Error("Failed to fetch applications");
  }
}

// Dynamic notification services hook placeholder
export async function triggerNotificationPlaceholder(type, payload) {
  console.log(`[Notification Service Placeholder] Event: ${type}. Payload:`, JSON.stringify(payload));
}
