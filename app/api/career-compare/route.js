import {
  generateGeminiJson,
  parseCsvParam,
  sanitizeStringArray,
  clampNumber,
} from "@/lib/career-ai";

const ALLOWED_LEVELS = ["High", "Medium", "Low"];

function normalizeLevel(value, fallback = "Medium") {
  const normalized = String(value || "").trim();
  if (ALLOWED_LEVELS.includes(normalized)) {
    return normalized;
  }

  const lowered = normalized.toLowerCase();
  if (lowered === "high") return "High";
  if (lowered === "medium") return "Medium";
  if (lowered === "low") return "Low";
  return fallback;
}

function normalizeComparisonResponse(parsed) {
  if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.comparisons)) {
    throw new Error("Invalid comparison payload from AI");
  }

  const comparisons = parsed.comparisons.map((item) => ({
    career: String(item?.career || "Career"),
    salary_range: String(item?.salary_range || "Not available"),
    salary: String(item?.salary_range || "Not available"),
    growth: normalizeLevel(item?.growth),
    demand: normalizeLevel(item?.demand),
    learning_curve: normalizeLevel(item?.learning_curve),
    learningCurve: normalizeLevel(item?.learning_curve),
    score: clampNumber(item?.score, 0, 100, 50),
    pros: sanitizeStringArray(item?.pros),
    cons: sanitizeStringArray(item?.cons),
  }));

  return {
    comparisons,
    recommendation: String(parsed.recommendation || "No recommendation generated"),
  };
}

function buildComparisonPrompt({ skills, interests, selected_careers }) {
  return `You are a career analysis expert.

User profile:
Skills: ${skills.join(", ") || "Not provided"}
Interests: ${interests.join(", ") || "Not provided"}

Careers to compare:
${selected_careers.join(", ")}

Generate comparison data.

Return JSON:
{
  "comparisons": [
    {
      "career": "",
      "salary_range": "",
      "growth": "High/Medium/Low",
      "demand": "High/Medium/Low",
      "learning_curve": "High/Medium/Low",
      "score": 0,
      "pros": [],
      "cons": []
    }
  ],
  "recommendation": ""
}

Ensure realistic and consistent scoring.
Return ONLY JSON.`;
}

async function generateComparison(input) {
  const prompt = buildComparisonPrompt(input);
  const parsed = await generateGeminiJson(prompt, 24000);
  return normalizeComparisonResponse(parsed);
}

export async function POST(req) {
  try {
    const body = await req.json();

    const skills = sanitizeStringArray(body?.skills);
    const interests = sanitizeStringArray(body?.interests);
    const selected_careers = sanitizeStringArray(body?.selected_careers);

    if (selected_careers.length === 0) {
      return Response.json(
        { success: false, error: "selected_careers must contain at least one career" },
        { status: 400 },
      );
    }

    const data = await generateComparison({ skills, interests, selected_careers });
    return Response.json({ success: true, data });
  } catch (error) {
    console.error("Career compare API error:", error);
    return Response.json(
      {
        success: false,
        error:
          "Unable to generate career comparison right now. Please try again.",
      },
      { status: 500 },
    );
  }
}

// Backward-compatible GET for current UI while still using AI generation.
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const skills = parseCsvParam(searchParams.get("skills"));
    const interests = parseCsvParam(searchParams.get("interests"));
    const selected_careers =
      parseCsvParam(searchParams.get("selected_careers")).length > 0
        ? parseCsvParam(searchParams.get("selected_careers"))
        : ["Software Engineer", "Product Manager", "Data Analyst"];

    const generated = await generateComparison({ skills, interests, selected_careers });

    return Response.json({
      success: true,
      data: generated.comparisons,
      recommendation: generated.recommendation,
    });
  } catch (error) {
    console.error("Career compare GET API error:", error);
    return Response.json(
      {
        success: false,
        error:
          "Unable to generate career comparison right now. Please try again.",
      },
      { status: 500 },
    );
  }
}
