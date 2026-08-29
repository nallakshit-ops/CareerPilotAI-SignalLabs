import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { runSignalEngine } from "@/lib/signals/signal-engine";

export async function POST(req) {
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

    let forceRefresh = false;
    try {
      const body = await req.json();
      forceRefresh = !!body?.forceRefresh;
    } catch {
      // Body may be empty on plain POST
    }

    const result = await runSignalEngine(user.id, { forceRefresh });
    return Response.json({ success: true, ...result });
  } catch (error) {
    console.error("POST /api/signals/generate error:", error);
    return Response.json(
      { success: false, error: error.message || "Failed to generate signals" },
      { status: 500 }
    );
  }
}
