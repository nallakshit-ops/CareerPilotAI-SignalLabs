"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { executeWithKeyRotation } from "@/lib/gemini-pool";

export const generateAIInsights = async (industry) => {
  const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "High" | "Medium" | "Low",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "Positive" | "Neutral" | "Negative",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;

  // Use key rotation and model fallback chain
  const models = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
  let result;
  let lastError;

  for (const modelName of models) {
    try {
      result = await executeWithKeyRotation(async (apiKey) => {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json",
          },
        });
        return await model.generateContent(prompt);
      });
      break; // Success
    } catch (error) {
      lastError = error;
      const isRetryable =
        error.status === 429 ||
        error.status === 404 ||
        error.message?.includes("quota") ||
        error.message?.includes("rate limit") ||
        error.message?.includes("429") ||
        error.message?.includes("404") ||
        error.message?.includes("no longer available") ||
        error.message?.includes("not found");

      if (isRetryable) {
        console.warn(`⚠️ Model ${modelName} unavailable/rate-limited during insights generation, trying next model...`);
        continue;
      }
      throw error;
    }
  }

  if (!result) {
    throw lastError || new Error("All Gemini models exhausted for insights generation.");
  }

  const response = result.response;
  const text = response.text();
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
  const match = cleanedText.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Invalid response format");

  return JSON.parse(match[0]);
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  // If no insights exist, generate them
  if (!user.industryInsight) {
    const insights = await generateAIInsights(user.industry);

    const industryInsight = await db.industryInsight.create({
      data: {
        industry: user.industry,
        ...insights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return industryInsight;
  }

  return user.industryInsight;
}

export async function getCandidateDashboardStats() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      candidateApplications: true,
      candidateCalls: true,
      assessments: true,
    },
  });

  if (!user) throw new Error("User not found");

  const totalApplications = user.candidateApplications.length;
  const shortlisted = user.candidateApplications.filter(
    (a) => ["shortlisted", "interview_invited", "interview_accepted", "interview_completed", "human_round_scheduled", "selected"].includes(a.status)
  ).length;

  const selected = user.candidateApplications.filter((a) => a.status === "selected").length;

  const shortlistRate = totalApplications > 0 ? Math.round((shortlisted / totalApplications) * 100) : 0;
  const successRate = totalApplications > 0 ? Math.round((selected / totalApplications) * 100) : 0;

  return {
    applicationsSent: totalApplications,
    shortlistRate,
    successRate,
    interviewsCount: user.candidateCalls.length,
    skillsCount: user.skills?.length || 0,
    assessmentsCount: user.assessments?.length || 0,
  };
}
