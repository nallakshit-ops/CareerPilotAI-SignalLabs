import {
  generateGeminiJson,
  parseCsvParam,
  sanitizeStringArray,
  clampNumber,
} from "@/lib/career-ai";

function normalizeSimulationResponse(parsed) {
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid simulation payload from AI");
  }

  const rawTimeline = Array.isArray(parsed.timeline) ? parsed.timeline : [];
  if (rawTimeline.length === 0) {
    throw new Error("Timeline is missing in AI response");
  }

  const targetYears = [1, 3, 5];
  const timeline = targetYears.map((year, index) => {
    const stage =
      rawTimeline.find((item) => Number(item?.year) === year) ||
      rawTimeline[index] ||
      {};

    const skills = sanitizeStringArray(stage.skills);
    const probabilityRaw = String(
      stage.promotion_probability ?? stage.promotionProbability ?? "",
    ).replace(/[^\d]/g, "");

    return {
      year,
      role: String(stage.role || `Role at Year ${year}`),
      salary: String(stage.salary || "₹0L"),
      skills,
      promotion_probability: `${clampNumber(probabilityRaw || 0, 0, 100, 0)}%`,
      promotionProbability: clampNumber(probabilityRaw || 0, 0, 100, 0),
    };
  });

  return {
    career: String(parsed.career || "Suitable Career Path"),
    timeline,
  };
}

function buildSimulationPrompt({ resume_text, skills, interests }) {
  return `You are an expert career advisor.

Based on the following user profile:
Resume: ${resume_text}
Skills: ${skills.join(", ") || "Not provided"}
Interests: ${interests.join(", ") || "Not provided"}

Generate a realistic career progression for one suitable career.

Requirements:
- Include 3 stages: Year 1, Year 3, Year 5
- For each stage include:
  - role
  - salary (in INR range)
  - required skills
  - promotion probability (in %)
- Keep it realistic for Indian job market

Output ONLY JSON in this format:
{
  "career": "",
  "timeline": [
    {
      "year": 1,
      "role": "",
      "salary": "",
      "skills": [],
      "promotion_probability": ""
    }
  ]
}
Ensure valid JSON only.`;
}

async function generateSimulation(input) {
  const prompt = buildSimulationPrompt(input);
  const parsed = await generateGeminiJson(prompt, 22000);
  return normalizeSimulationResponse(parsed);
}

export async function POST(req) {
  try {
    const body = await req.json();

    const resume_text = String(body?.resume_text || "").trim();
    const skills = sanitizeStringArray(body?.skills);
    const interests = sanitizeStringArray(body?.interests);

    if (!resume_text) {
      return Response.json(
        { success: false, error: "resume_text is required" },
        { status: 400 },
      );
    }

    const data = await generateSimulation({ resume_text, skills, interests });
    return Response.json({ success: true, data });
  } catch (error) {
    console.error("Career simulate API error:", error);
    return Response.json(
      {
        success: false,
        error:
          "Unable to generate career simulation right now. Please try again.",
      },
      { status: 500 },
    );
  }
}

// Backward-compatible GET for current UI while still using AI generation.
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const resume_text = String(searchParams.get("resume_text") || "General software profile");
    const skills = parseCsvParam(searchParams.get("skills"));
    const interests = parseCsvParam(searchParams.get("interests"));

    const data = await generateSimulation({ resume_text, skills, interests });
    return Response.json({ success: true, data });
  } catch (error) {
    console.error("Career simulate GET API error:", error);
    return Response.json(
      {
        success: false,
        error:
          "Unable to generate career simulation right now. Please try again.",
      },
      { status: 500 },
    );
  }
}
