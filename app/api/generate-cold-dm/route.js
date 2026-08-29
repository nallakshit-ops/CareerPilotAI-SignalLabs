import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { executeWithKeyRotation } from "@/lib/gemini-pool";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { name: true, bio: true, skills: true, experience: true },
    });

    const body = await req.json();
    const { companyName, jobTitle, tone = "professional" } = body;

    if (!companyName || !jobTitle) {
      return Response.json(
        { error: "companyName and jobTitle are required" },
        { status: 400 }
      );
    }

    const userName = user?.name || "the candidate";
    const userSkills = user?.skills?.join(", ") || "various technical skills";
    const userExp = user?.experience || 0;

    // Use a structured prompt that asks for subject and message separately
    const prompt = `Write a LinkedIn cold outreach message.

Sender: ${userName}, ${userExp} years experience, skills: ${userSkills}.
Target Role: ${jobTitle} at ${companyName}
Tone: ${tone}

Requirements:
- 150-200 words total
- Start with a genuine, specific reason for reaching out
- Mention 1-2 relevant skills from the sender's profile
- End with a simple call-to-action like asking for a quick chat
- Sound human and friendly, not robotic

Respond as JSON with exactly these fields:
{
  "subject": "A short email subject line (5-8 words)",
  "message": "The complete outreach message with proper paragraph breaks. Use multiple paragraphs separated by newlines."
}`;

    // Model fallback chain — each model has separate rate limits
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
              maxOutputTokens: 2048,
              temperature: 0.7,
              responseMimeType: "application/json",
            },
          });
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
          console.warn(`⚠️ Model ${modelName} unavailable/rate-limited, trying next...`);
          continue;
        }
        throw error;
      }
    }

    if (!result) {
      throw lastError || new Error("All Gemini models exhausted.");
    }

    const rawText = result.response.text().trim();
    console.log("Cold DM raw response:", rawText.substring(0, 200));

    // Parse the JSON response
    let subject = `Interested in ${jobTitle} at ${companyName}`;
    let message = "";

    try {
      const parsed = JSON.parse(rawText);
      subject = parsed.subject || subject;
      message = parsed.message || "";
    } catch {
      // Try to extract from markdown-wrapped JSON
      const cleaned = rawText.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
      try {
        const parsed = JSON.parse(cleaned);
        subject = parsed.subject || subject;
        message = parsed.message || "";
      } catch {
        // Last resort: extract message field with regex
        const msgMatch = rawText.match(/"message"\s*:\s*"([\s\S]*?)(?:"\s*[,}])/);
        if (msgMatch) {
          message = msgMatch[1];
        }
      }
    }

    // If we still have no message, generate a default one
    if (!message || message.length < 20) {
      message = `Hi there!\n\nI came across the ${jobTitle} position at ${companyName} and I'm very interested. With ${userExp} years of experience in ${userSkills}, I believe my background aligns well with what you're looking for.\n\nI'd love the opportunity to discuss how my skills could contribute to your team. Would you be open to a brief 15-minute chat this week?\n\nBest regards,\n${userName}`;
    }

    // Clean up the message — convert literal escape sequences to real characters
    message = message
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "  ")
      .replace(/\\"/g, '"')
      .trim();

    const linkedinSearchUrl = `https://www.linkedin.com/search/results/people/?keywords=recruiter%20${companyName.replace(/ /g, "%20")}`;

    console.log("Cold DM generated successfully. Message length:", message.length);

    return Response.json({
      success: true,
      subject,
      message,
      linkedinSearchUrl,
      fromCache: false,
    });
  } catch (error) {
    console.error("Cold DM generation error:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to generate cold DM. Please try again.",
      },
      { status: 500 }
    );
  }
}
