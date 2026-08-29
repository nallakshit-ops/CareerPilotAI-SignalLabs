import {
  generateGeminiJson,
  parseCsvParam,
  sanitizeStringArray,
  clampNumber,
} from "@/lib/career-ai";

const ALLOWED_RISK = ["Low", "Medium", "High"];
const ALLOWED_OUTLOOK = ["Growing", "Stable", "Declining"];

function normalizeLabel(value, allowed, fallback) {
  const normalized = String(value || "").trim();
  if (allowed.includes(normalized)) {
    return normalized;
  }

  const lower = normalized.toLowerCase();
  const matched = allowed.find((item) => item.toLowerCase() === lower);
  return matched || fallback;
}

function normalizeSingleRisk(item) {
  if (!item || typeof item !== "object") {
    throw new Error("Invalid risk payload from AI");
  }

  return {
    career: String(item.career || "Career"),
    risk_level: normalizeLabel(item.risk_level, ALLOWED_RISK, "Medium"),
    risk: normalizeLabel(item.risk_level, ALLOWED_RISK, "Medium"),
    automation_risk: clampNumber(item.automation_risk, 0, 100, 50),
    market_demand_risk: clampNumber(item.market_demand_risk, 0, 100, 50),
    skill_obsolescence_risk: clampNumber(item.skill_obsolescence_risk, 0, 100, 50),
    automationRisk: clampNumber(item.automation_risk, 0, 100, 50),
    marketDemandRisk: clampNumber(item.market_demand_risk, 0, 100, 50),
    skillObsolescenceRisk: clampNumber(item.skill_obsolescence_risk, 0, 100, 50),
    reason: String(item.reason || "No reason generated"),
    future_outlook: normalizeLabel(item.future_outlook, ALLOWED_OUTLOOK, "Stable"),
    outlook: normalizeLabel(item.future_outlook, ALLOWED_OUTLOOK, "Stable"),
    suggestions: sanitizeStringArray(item.suggestions),
    suggestion: sanitizeStringArray(item.suggestions).join(", "),
  };
}

function buildRiskPrompt({ skills, selected_career }) {
  return `You are an AI job market analyst.

Given:
Skills: ${skills.join(", ") || "Not provided"}
Career: ${selected_career}

Analyze future risks.

Return JSON:
{
  "career": "",
  "risk_level": "Low/Medium/High",
  "automation_risk": 0,
  "market_demand_risk": 0,
  "skill_obsolescence_risk": 0,
  "reason": "",
  "future_outlook": "Growing/Stable/Declining",
  "suggestions": []
}

Ensure realistic analysis based on AI trends.
Return ONLY JSON.`;
}

function buildMultiRiskPrompt({ skills, careers }) {
  return `You are an AI job market analyst.

Given user skills: ${skills.join(", ") || "Not provided"}

Analyze future risk for each of these careers:
${careers.join(", ")}

Return ONLY JSON in this format:
{
  "risks": [
    {
      "career": "",
      "risk_level": "Low/Medium/High",
      "automation_risk": 0,
      "market_demand_risk": 0,
      "skill_obsolescence_risk": 0,
      "reason": "",
      "future_outlook": "Growing/Stable/Declining",
      "suggestions": []
    }
  ]
}`;
}

async function generateRiskForCareer(input) {
  const prompt = buildRiskPrompt(input);
  const parsed = await generateGeminiJson(prompt, 22000);
  return normalizeSingleRisk(parsed);
}

async function generateRiskForCareerList(input) {
  const prompt = buildMultiRiskPrompt(input);
  const parsed = await generateGeminiJson(prompt, 25000);

  if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.risks)) {
    throw new Error("Invalid multi-risk payload from AI");
  }

  return parsed.risks.map(normalizeSingleRisk);
}

export async function POST(req) {
  try {
    const body = await req.json();

    const skills = sanitizeStringArray(body?.skills);
    const selected_career =
      String(body?.selected_career || "").trim() ||
      sanitizeStringArray(body?.selected_careers)[0] ||
      "";

    if (!selected_career) {
      return Response.json(
        { success: false, error: "selected_career is required" },
        { status: 400 },
      );
    }

    const data = await generateRiskForCareer({ skills, selected_career });
    return Response.json({ success: true, data });
  } catch (error) {
    console.error("Career risk API error:", error);
    return Response.json(
      {
        success: false,
        error: "Unable to generate career risk prediction right now. Please try again.",
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
    const careers =
      parseCsvParam(searchParams.get("selected_careers")).length > 0
        ? parseCsvParam(searchParams.get("selected_careers"))
        : [
            "Software Engineer",
            "Product Manager",
            "Data Analyst",
            "Cloud Engineer",
            "Cybersecurity Analyst",
          ];

    const data = await generateRiskForCareerList({ skills, careers });
    return Response.json({ success: true, data });
  } catch (error) {
    console.error("Career risk GET API error:", error);
    return Response.json(
      {
        success: false,
        error: "Unable to generate career risk prediction right now. Please try again.",
      },
      { status: 500 },
    );
  }
}
