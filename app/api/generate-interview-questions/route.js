import { GoogleGenerativeAI } from "@google/generative-ai";
import { executeWithKeyRotation } from "@/lib/gemini-pool";

function getFallbackQuestions(industry, role, company) {
  const target = role || "professional";
  const companyPrefix = company ? ` at ${company}` : "";
  return [
    `Can you introduce yourself and explain what makes you a strong candidate for this ${target} position${companyPrefix}?`,
    `Tell me about a technically challenging project you worked on recently in the ${industry} domain and how you solved it.`,
    `How do you prioritize tasks and manage tight deadlines or changing requirements when working on critical deliverables?`,
    `Describe a time when you had a disagreement with a team member or stakeholder. How did you handle the situation and achieve a positive outcome?`,
    `What are your long-term career goals, and how will excelling in this role help you achieve them?`
  ];
}

export async function POST(req) {
  let industry, role, skills, company, jobDescription;
  try {
    const body = await req.json();
    industry = body.industry;
    role = body.role;
    skills = body.skills;
    company = body.company;
    jobDescription = body.jobDescription;

    if (!industry) {
      return Response.json(
        { error: "Industry is required" },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert AI interviewer.

Create exactly 5 interview questions for a candidate applying for a ${role || "professional"
      } role in the ${industry} industry.

${company
        ? `The candidate is specifically preparing for interviews at ${company}.
Adapt the tone, difficulty, and focus to match ${company}'s real interview style.
Reflect what ${company} values most in candidates.`
        : ""
      }

${jobDescription
        ? `Use this job description to tailor question topics, required skills, and scenario depth:
${jobDescription}`
        : ""
      }

${skills?.length
        ? `The candidate has expertise in: ${skills.join(", ")}.`
        : ""
      }

Guidelines:
- Questions must be conversational and natural (good for text-to-speech).
- Make them increasingly challenging.
- Include a mix of:
  - Behavioral questions
  - Technical questions
  - Problem-solving questions
${company
        ? `- If a company is provided, tailor questions to that company's known interview patterns 
      (e.g., leadership principles for Amazon, system design for Google, product thinking for Meta, etc.).`
        : ""
      }
${jobDescription
        ? `- Ensure at least 3 of the 5 questions are directly tied to the job description expectations.`
        : ""
      }

Return STRICT JSON format ONLY:

{
  "questions": [
    "string",
    "string",
    "string",
    "string",
    "string"
  ]
}
`;

    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.5-flash-lite"];
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
          console.warn(`⚠️ Model ${modelName} unavailable/rate-limited, trying next model...`);
          continue;
        }
        throw error;
      }
    }

    if (!result) {
      throw lastError || new Error("All Gemini models exhausted.");
    }

    const response = result.response;
    const text = response.text();

    // Clean Gemini formatting (remove ```json blocks)
    const cleanedText = text
      .replace(/```(?:json)?\n?/g, "")
      .replace(/```/g, "")
      .trim();

    // Extract JSON safely
    const match = cleanedText.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new Error("Invalid response format from Gemini");
    }

    const data = JSON.parse(match[0]);

    if (
      !data.questions ||
      !Array.isArray(data.questions) ||
      data.questions.length < 3
    ) {
      throw new Error("Questions not generated properly");
    }

    return Response.json({
      questions: data.questions.slice(0, 5),
    });
  } catch (error) {
    console.error("Live Interview Question Generation Error:", error);

    // Fallback to high quality curated questions if AI service is temporarily unavailable
    const fallbackQuestions = getFallbackQuestions(industry || "Tech", role || "Candidate", company);
    return Response.json({
      questions: fallbackQuestions,
      isFallback: true,
    });
  }
}