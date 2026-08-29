import { auth } from "@clerk/nextjs/server";
import { createJob, getJob, updateJob } from "@/lib/talentsync-job-store";

const TALENTSYNC_API_URL =
  process.env.TALENTSYNC_API_URL ||
  "https://auto-workflow-api.supervity.ai/api/v1/workflow-runs/execute/stream";

const TALENTSYNC_WORKFLOW_ID =
  process.env.TALENTSYNC_WORKFLOW_ID || "019d2470-0db1-7000-8591-23fa786ce36c";

function sanitizePayload(body) {
  return {
    mode: "job_seeker",
    resumeText: (body.resumeText || "").toString().trim(),
    jobDescription: (body.jobDescription || "").toString().trim(),
    companyName: (body.companyName || "").toString().trim(),
    email: (body.email || "").toString().trim(),
    bearerToken: (body.bearerToken || "").toString().trim(),
    eligibilityThreshold:
      body.eligibilityThreshold === "" || body.eligibilityThreshold == null
        ? 70
        : Number(body.eligibilityThreshold),
  };
}

function parseResponsePayload(rawText) {
  try {
    return JSON.parse(rawText);
  } catch {
    const lines = rawText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const dataLines = lines
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trim())
      .filter((line) => line && line !== "[DONE]");

    if (dataLines.length === 0) {
      return { raw: rawText };
    }

    const parsedChunks = dataLines.map((chunk) => {
      try {
        return JSON.parse(chunk);
      } catch {
        return chunk;
      }
    });

    return { chunks: parsedChunks, raw: rawText };
  }
}

function normalizeBearerToken(token) {
  if (!token) return "";
  return token.replace(/^Bearer\s+/i, "").trim();
}

async function runTalentSyncJob(jobId, payload) {
  const token = normalizeBearerToken(
    payload.bearerToken || process.env.TALENTSYNC_BEARER_TOKEN,
  );

  if (!token) {
    updateJob(jobId, {
      status: "failed",
      progress: 100,
      message:
        "Missing access token. Set TALENTSYNC_BEARER_TOKEN on server or provide token in Growth Tools page.",
      error:
        "Missing access token. Set TALENTSYNC_BEARER_TOKEN on server or provide token in Growth Tools page.",
      completedAt: new Date().toISOString(),
    });
    return;
  }

  const progressTimer = setInterval(() => {
    const current = getJob(jobId);
    if (!current) return;
    if (current.status !== "running") return;

    const nextProgress = Math.min(current.progress + 3, 92);
    updateJob(jobId, {
      progress: nextProgress,
      message:
        "TalentSync AI is processing your request. You can use other features and return anytime.",
    });
  }, 8000);

  try {
    updateJob(jobId, {
      status: "running",
      progress: 12,
      message: "Uploading resume and job description...",
    });

    const formData = new FormData();
    formData.append("workflowId", TALENTSYNC_WORKFLOW_ID);
    formData.append("inputs[mode]", payload.mode);
    formData.append(
      "inputs[resume_file]",
      new Blob([payload.resumeText], { type: "text/plain" }),
      "resume.txt",
    );
    formData.append(
      "inputs[job_description_file]",
      new Blob([payload.jobDescription], { type: "text/plain" }),
      "job-description.txt",
    );
    formData.append("inputs[company_name]", payload.companyName);
    formData.append("inputs[email]", payload.email);
    formData.append(
      "inputs[eligibility_threshold]",
      String(payload.eligibilityThreshold),
    );

    updateJob(jobId, {
      progress: 25,
      message: "Request accepted. TalentSync AI is running (usually 3-5 minutes).",
    });

    const controller = new AbortController();
    const requestTimeout = setTimeout(() => controller.abort(), 6 * 60 * 1000);

    const response = await fetch(TALENTSYNC_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "x-source": "v1",
      },
      body: formData,
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(requestTimeout);

    const rawText = await response.text();

    if (!response.ok) {
      throw new Error(rawText || "TalentSync API request failed");
    }

    const parsedResult = parseResponsePayload(rawText);

    updateJob(jobId, {
      status: "completed",
      progress: 100,
      message: "Completed successfully",
      result: parsedResult,
      completedAt: new Date().toISOString(),
      error: null,
    });
  } catch (error) {
    const timeoutHint =
      error?.name === "AbortError"
        ? "TalentSync request timed out after 6 minutes"
        : null;

    updateJob(jobId, {
      status: "failed",
      progress: 100,
      message: "Failed to complete TalentSync run",
      error: timeoutHint || error?.message || "Unknown error",
      completedAt: new Date().toISOString(),
    });
  } finally {
    clearInterval(progressTimer);
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const payload = sanitizePayload(body);

    if (!payload.resumeText || !payload.jobDescription) {
      return Response.json(
        { error: "resumeText and jobDescription are required" },
        { status: 400 },
      );
    }

    if (!payload.companyName) {
      return Response.json(
        { error: "companyName is required" },
        { status: 400 },
      );
    }

    const job = createJob({ userId, payload });

    runTalentSyncJob(job.id, payload);

    return Response.json({
      success: true,
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      message: job.message,
      createdAt: job.createdAt,
    });
  } catch (error) {
    return Response.json(
      { error: error?.message || "Unable to start TalentSync run" },
      { status: 500 },
    );
  }
}
