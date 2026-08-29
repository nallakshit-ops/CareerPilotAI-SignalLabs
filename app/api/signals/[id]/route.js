import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return Response.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const signal = await db.careerSignal.findUnique({
      where: { id },
      include: {
        actions: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!signal || signal.userId !== user.id) {
      return Response.json({ success: false, error: "Signal not found" }, { status: 404 });
    }

    return Response.json({ success: true, signal });
  } catch (error) {
    console.error("GET /api/signals/[id] error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch signal details" },
      { status: 500 }
    );
  }
}
