import { auth } from "@clerk/nextjs/server";
import { listJobsByUser } from "@/lib/talentsync-job-store";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobs = listJobsByUser(userId, 30).map((job) => ({
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
    }));

    return Response.json({ success: true, jobs });
  } catch (error) {
    return Response.json(
      { error: error?.message || "Unable to fetch TalentSync history" },
      { status: 500 },
    );
  }
}
