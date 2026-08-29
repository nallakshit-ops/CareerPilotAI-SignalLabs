"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const role = data.role || "candidate";

    if (role === "recruiter") {
      const recruiterIndustryKey = `recruiter-${(data.hiringDomain || "general").toLowerCase().replace(/ /g, "-")}`;

      // Satisfy foreign key constraint User_industry_fkey by ensuring industry key exists
      let existingInsight = await db.industryInsight.findUnique({
        where: { industry: recruiterIndustryKey },
      });

      if (!existingInsight) {
        await db.industryInsight.create({
          data: {
            industry: recruiterIndustryKey,
            salaryRanges: [],
            growthRate: 0,
            demandLevel: "Medium",
            topSkills: [],
            marketOutlook: "Stable",
            keyTrends: ["Recruitment focus"],
            recommendedSkills: [],
            nextUpdate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Far in the future
          },
        });
      }

      // Now update the user safely
      const updatedUser = await db.user.update({
        where: { id: user.id },
        data: {
          role: "recruiter",
          companyName: data.companyName,
          companyRole: data.companyRole,
          hiringDomain: data.hiringDomain,
          companyDetails: data.companyDetails || null,
          bio: data.bio || null,
          industry: recruiterIndustryKey,
        },
      });

      revalidatePath("/");
      return { success: true, user: updatedUser };
    }

    // Candidate onboarding — PRESERVED original logic
    const result = await db.$transaction(
      async (tx) => {
        // First check if industry exists
        let industryInsight = await tx.industryInsight.findUnique({
          where: {
            industry: data.industry,
          },
        });

        // If industry doesn't exist, create it with default values
        if (!industryInsight) {
          const insights = await generateAIInsights(data.industry);

          industryInsight = await db.industryInsight.create({
            data: {
              industry: data.industry,
              ...insights,
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        }

        // Now update the user
        const updatedUser = await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            role: "candidate",
            industry: data.industry,
            experience: data.experience,
            bio: data.bio,
            skills: data.skills ?? [],
            videoResumeUrl: data.videoResumeUrl || null,
            resumeDriveUrl: data.resumeDriveUrl || null,
          },
        });

        return { updatedUser, industryInsight };
      },
      {
        timeout: 30000, // Increased timeout to 30s to allow Gemini fallbacks to complete
      }
    );

    revalidatePath("/");
    return {
      success: true,
      user: result.updatedUser,
    };
  } catch (error) {
    console.error("Error updating user and industry:", error.message);
    throw new Error("Failed to update profile");
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      select: {
        industry: true,
      },
    });

    return {
      isOnboarded: !!user?.industry,
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    throw new Error("Failed to check onboarding status");
  }
}
