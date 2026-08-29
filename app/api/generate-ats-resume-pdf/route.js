import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import puppeteer from "puppeteer";

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
  return String(text || "").trim().replace(/[<>]/g, "");
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

/**
 * Generate HTML template for ATS-optimized resume
 * Designed to fit exactly 1 page with professional formatting
 */
function generateResumeHTML(resumeData) {
  const { name, email, phone, linkedin, github, location, summary, skills, experience, education, projects, certifications } = resumeData;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      font-size: 10pt;
      line-height: 1.3;
      color: #000;
      padding: 0.5in 0.6in;
      max-width: 8.5in;
    }
    
    .header {
      text-align: center;
      margin-bottom: 12px;
      border-bottom: 1.5px solid #000;
      padding-bottom: 8px;
    }
    
    .name {
      font-size: 18pt;
      font-weight: bold;
      margin-bottom: 4px;
      letter-spacing: 0.5px;
    }
    
    .contact {
      font-size: 9pt;
      color: #333;
      line-height: 1.4;
    }
    
    .contact a {
      color: #0066cc;
      text-decoration: none;
    }
    
    .section {
      margin-bottom: 10px;
    }
    
    .section-title {
      font-size: 11pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 1px solid #333;
      padding-bottom: 2px;
      margin-bottom: 6px;
      margin-top: 4px;
    }
    
    .summary {
      font-size: 10pt;
      line-height: 1.4;
      text-align: justify;
    }
    
    .skills-list {
      font-size: 9.5pt;
      line-height: 1.5;
      color: #111;
    }
    
    .experience-item, .education-item, .project-item {
      margin-bottom: 8px;
    }
    
    .exp-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2px;
    }
    
    .exp-title {
      font-weight: bold;
      font-size: 10.5pt;
    }
    
    .exp-company {
      font-style: italic;
      font-size: 10pt;
    }
    
    .exp-duration {
      font-size: 9pt;
      color: #555;
    }
    
    .exp-description {
      margin-left: 12px;
      margin-top: 2px;
    }
    
    .exp-description li {
      margin-bottom: 1px;
      font-size: 9.5pt;
      line-height: 1.35;
    }
    
    .edu-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    
    .edu-degree {
      font-weight: bold;
      font-size: 10pt;
    }
    
    .edu-institution {
      font-size: 9.5pt;
      color: #333;
    }
    
    .cert-item {
      font-size: 9.5pt;
      margin-bottom: 2px;
    }
    
    @page {
      size: letter;
      margin: 0;
    }
    
    @media print {
      body {
        padding: 0.5in 0.6in;
      }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div class="name">${name}</div>
    <div class="contact">
      ${email ? `${email}` : ''}
      ${phone ? ` • ${phone}` : ''}
      ${location ? ` • ${location}` : ''}
      ${linkedin ? `<br><a href="${linkedin.startsWith('http') ? linkedin : 'https://' + linkedin}">${linkedin.replace(/^https?:\/\/(www\.)?/, '')}</a>` : ''}
      ${github ? ` • <a href="${github.startsWith('http') ? github : 'https://' + github}">${github.replace(/^https?:\/\/(www\.)?/, '')}</a>` : ''}
    </div>
  </div>

  ${summary ? `
  <!-- Professional Summary -->
  <div class="section">
    <div class="section-title">Professional Summary</div>
    <div class="summary">${summary}</div>
  </div>
  ` : ''}

  ${skills && skills.length > 0 ? `
  <!-- Skills -->
  <div class="section">
    <div class="section-title">Technical Skills</div>
    <div class="skills-list">
      <b>Core Competencies:</b> ${skills.join(' <span style="color:#666; margin:0 4px">•</span> ')}
    </div>
  </div>
  ` : ''}

  ${experience && experience.length > 0 ? `
  <!-- Experience -->
  <div class="section">
    <div class="section-title">Professional Experience</div>
    ${experience.map(exp => `
      <div class="experience-item">
        <div class="exp-header">
          <div>
            <span class="exp-title">${exp.title}</span>
            ${exp.company ? ` <span class="exp-company">| ${exp.company}</span>` : ''}
          </div>
          ${exp.duration ? `<span class="exp-duration">${exp.duration}</span>` : ''}
        </div>
        ${exp.description && exp.description.length > 0 ? `
          <ul class="exp-description">
            ${exp.description.map(desc => `<li>${desc}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${projects && projects.length > 0 ? `
  <!-- Projects -->
  <div class="section">
    <div class="section-title">Notable Projects</div>
    ${projects.slice(0, 2).map(proj => `
      <div class="project-item">
        <div class="exp-header">
          <div>
            <span class="exp-title">${proj.name}</span>
            ${proj.tech && proj.tech.length > 0 ? ` <span class="exp-company">| ${proj.tech.slice(0, 4).join(', ')}</span>` : ''}
          </div>
        </div>
        ${proj.description && proj.description.length > 0 ? `
          <ul class="exp-description">
            ${proj.description.slice(0, 2).map(desc => `<li>${desc}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${education && education.length > 0 ? `
  <!-- Education -->
  <div class="section">
    <div class="section-title">Education</div>
    ${education.map(edu => `
      <div class="education-item">
        <div class="edu-header">
          <div>
            <span class="edu-degree">${edu.degree}</span>
            ${edu.institution ? ` <span class="edu-institution">| ${edu.institution}</span>` : ''}
          </div>
          ${edu.year ? `<span class="exp-duration">${edu.year}</span>` : ''}
        </div>
        ${edu.gpa ? `<div style="font-size: 9pt; color: #555;">GPA: ${edu.gpa}</div>` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${certifications && certifications.length > 0 ? `
  <!-- Certifications -->
  <div class="section">
    <div class="section-title">Certifications</div>
    ${certifications.slice(0, 3).map(cert => `
      <div class="cert-item">• ${cert}</div>
    `).join('')}
  </div>
  ` : ''}
</body>
</html>
  `;
}

/**
 * Generate PDF using Puppeteer with 1-page constraint
 */
async function generatePDF(resumeData) {
  const html = generateResumeHTML(resumeData);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'letter',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true,
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
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

SKILLS TO INCORPORATE TO PASS ATS:
${missingSkillsList}

INSTRUCTIONS:
1. Extract ALL personal info from the resume (name, email, phone, LinkedIn, GitHub, location).
2. Rewrite the professional summary to directly mirror the job description's language and requirements.
3. In experience bullet points, naturally weave in the missing skills where possible. Do NOT fabricate companies or roles — only enhance existing ones.
4. You MUST add ALL "SKILLS TO INCORPORATE" to the skills section to ensure ATS compatibility. Do not skip any.
5. Reorder skills to put the most JD-relevant ones first.
6. Use strong action verbs and quantified achievements where possible.
7. Keep all dates, companies, institutions, and factual details EXACTLY as in the original.
8. For projects, highlight tech stack overlaps with the JD.
9. CRITICAL: Keep content concise to fit exactly 1 page. Prioritize most relevant experience.

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
      45000
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

    // Generate PDF
    const pdfBuffer = await generatePDF(resumeData);

    // Return PDF as base64 for frontend download
    // Puppeteer v23+ returns Uint8Array, not Buffer. Wrap in Buffer.from()
    // so .toString('base64') produces valid base64 instead of garbage.
    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

    return Response.json({ 
      success: true, 
      resumeData,
      pdfBase64,
      filename: `${resumeData.name.replace(/\s+/g, '_')}_ATS_Resume.pdf`
    });
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
