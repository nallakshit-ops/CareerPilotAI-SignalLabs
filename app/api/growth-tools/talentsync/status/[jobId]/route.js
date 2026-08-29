import { auth } from "@clerk/nextjs/server";
import { getJob } from "@/lib/talentsync-job-store";

export async function GET(_req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await params;
    const job = getJob(jobId);

    if (!job || job.userId !== userId) {
      return Response.json({ error: "Job not found" }, { status: 404 });
    }

    return Response.json({
      success: true,
      job: {
        id: job.id,
        status: job.status,
        progress: job.progress,
        message: job.message,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        completedAt: job.completedAt,
        payloadSummary: job.payloadSummary,
        result: job.result,
        error: job.error,
      },
    });
  } catch (error) {
    return Response.json(
      { error: error?.message || "Unable to fetch TalentSync status" },
      { status: 500 },
    );
  }
}
