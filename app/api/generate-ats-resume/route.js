import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), ms)
    ),
  ]);
}

function sanitizeText(text) {
  return String(text || "").trim();
}

function sanitizeArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => sanitizeText(item)).filter(Boolean);
}

function normalizeResumeJson(parsed, fallbackName) {
  return {
    name: sanitizeText(parsed.name || fallbackName || "Your Name"),
    email: sanitizeText(parsed.email || ""),
    phone: sanitizeText(parsed.phone || ""),
    linkedin: sanitizeText(parsed.linkedin || ""),
    github: sanitizeText(parsed.github || ""),
    location: sanitizeText(parsed.location || ""),
    summary: sanitizeText(parsed.summary || ""),
    skills: sanitizeArray(parsed.skills),
    experience: Array.isArray(parsed.experience)
      ? parsed.experience.map((exp) => ({
          title: sanitizeText(exp.title || ""),
          company: sanitizeText(exp.company || ""),
          duration: sanitizeText(exp.duration || ""),
          description: sanitizeArray(exp.description),
        }))
      : [],
    education: Array.isArray(parsed.education)
      ? parsed.education.map((edu) => ({
          degree: sanitizeText(edu.degree || ""),
          institution: sanitizeText(edu.institution || ""),
          year: sanitizeText(edu.year || ""),
          gpa: sanitizeText(edu.gpa || ""),
        }))
      : [],
    projects: Array.isArray(parsed.projects)
      ? parsed.projects.map((proj) => ({
          name: sanitizeText(proj.name || ""),
          tech: sanitizeArray(proj.tech),
          description: sanitizeArray(proj.description),
          link: sanitizeText(proj.link || ""),
        }))
      : [],
    certifications: sanitizeArray(parsed.certifications),
  };
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { resumeText, jobDescription, missingSkills } = body;

    if (!resumeText || !jobDescription) {
      return Response.json(
        { error: "resumeText and jobDescription are required" },
        { status: 400 }
      );
    }

    const missingSkillsList =
      Array.isArray(missingSkills) && missingSkills.length > 0
        ? missingSkills.join(", ")
        : "None identified";

    const prompt = `You are a senior technical resume writer and ATS optimization expert.

Your task: Rewrite the candidate's resume to be perfectly optimized for the given job description.

CANDIDATE RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

SKILLS TO NATURALLY INCORPORATE (if relevant to candidate's background):
${missingSkillsList}

INSTRUCTIONS:
1. Extract ALL personal info from the resume (name, email, phone, LinkedIn, GitHub, location).
2. Rewrite the professional summary to directly mirror the job description's language and requirements.
3. In experience bullet points, naturally weave in the missing skills where they could plausibly apply given the candidate's background. Do NOT fabricate companies or roles — only enhance existing ones.
4. Add missing skills to the skills section if they are genuinely relevant.
5. Reorder skills to put the most JD-relevant ones first.
6. Use strong action verbs and quantified achievements where possible.
7. Keep all dates, companies, institutions, and factual details EXACTLY as in the original.
8. For projects, highlight tech stack overlaps with the JD.

OUTPUT FORMAT — Return ONLY valid JSON, no markdown fences, no extra text:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "+1-xxx-xxx-xxxx",
  "linkedin": "linkedin.com/in/username",
  "github": "github.com/username",
  "location": "City, Country",
  "summary": "2-3 sentence professional summary tailored to this JD",
  "skills": ["Skill1", "Skill2", "Skill3"],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Month Year - Month Year",
      "description": [
        "Achievement or responsibility bullet point 1",
        "Achievement or responsibility bullet point 2"
      ]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "Institution Name",
      "year": "Year",
      "gpa": "GPA if present"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "tech": ["Tech1", "Tech2"],
      "description": ["What it does", "Impact or scale"],
      "link": "github.com/... or deployed link"
    }
  ],
  "certifications": ["Certification Name - Issuer (Year)"]
}`;

    const result = await withTimeout(
      model.generateContent(prompt),
      30000
    );

    const text = result.response.text().trim();

    const cleaned = text
      .replace(/```(?:json)?\s*/gi, "")
      .replace(/```/g, "")
      .trim();

    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("AI returned invalid JSON structure");
    }

    const parsed = JSON.parse(match[0]);
    const resumeData = normalizeResumeJson(parsed, user.name);

    return Response.json({ success: true, resumeData });
  } catch (error) {
    console.error("ATS Resume Generation Error:", error);
    return Response.json(
      {
        success: false,
        error:
          error.message === "Request timed out"
            ? "Resume generation timed out. Please try again."
            : "Failed to generate ATS resume. Please try again.",
      },
      { status: 500 }
    );
  }
}
