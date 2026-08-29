import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { getUserSignalsWithSummary } from "@/lib/signals/signal-engine";

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    let user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      const { checkUser } = await import("@/lib/checkUser");
      user = await checkUser();
    }

    if (!user) {
      return Response.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const data = await getUserSignalsWithSummary(user.id);
    return Response.json({ success: true, ...data });
  } catch (error) {
    console.error("GET /api/signals error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch career signals" },
      { status: 500 }
    );
  }
}
