"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";
import { executeWithKeyRotation } from "@/lib/gemini-pool";

export async function generateCoverLetter(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
    Write a professional cover letter for a ${data.jobTitle} position at ${data.companyName
    }.
    
    About the candidate:
    - Industry: ${user.industry}
    - Years of Experience: ${user.experience}
    - Skills: ${user.skills?.join(", ")}
    - Professional Background: ${user.bio}
    
    Job Description:
    ${data.jobDescription}
    
    Requirements:
    1. Use a professional, enthusiastic tone
    2. Highlight relevant skills and experience
    3. Show understanding of the company's needs
    4. Keep it concise (max 400 words)
    5. Use proper business letter formatting in markdown
    6. Include specific examples of achievements
    7. Relate candidate's background to job requirements
    
    Format the letter in markdown.
  `;

  try {
    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.5-flash-lite"];
    let result;
    let lastError;

    for (const modelName of models) {
      try {
        result = await executeWithKeyRotation(async (apiKey) => {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: modelName });
          return await model.generateContent(prompt);
        });
        break;
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
          console.warn(`⚠️ Model ${modelName} unavailable/rate-limited, trying next model...`);
          continue;
        }
        throw error;
      }
    }

    if (!result) {
      throw lastError || new Error("All Gemini models exhausted.");
    }

    const content = result.response.text().trim();

    const coverLetter = await db.coverLetter.create({
      data: {
        content,
        jobDescription: data.jobDescription,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        status: "completed",
        userId: user.id,
      },
    });

    return coverLetter;
  } catch (error) {
    console.error("Error generating cover letter:", error.message);
    throw new Error("Failed to generate cover letter");
  }
}

export async function getCoverLetters() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.coverLetter.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.coverLetter.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });
}

export async function deleteCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.coverLetter.delete({
    where: {
      id,
      userId: user.id,
    },
  });
}

export async function updateCoverLetter({ id, content }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");
  if (!id) throw new Error("Cover letter id is required");
  if (!content?.trim()) throw new Error("Cover letter content cannot be empty");

  const existing = await db.coverLetter.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!existing) throw new Error("Cover letter not found");

  const updated = await db.coverLetter.update({
    where: { id },
    data: { content: content.trim() },
  });

  revalidatePath("/ai-cover-letter");
  revalidatePath(`/ai-cover-letter/${id}`);

  return updated;
}
