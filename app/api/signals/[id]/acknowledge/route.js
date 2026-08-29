import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function POST(req, { params }) {
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
    });

    if (!signal || signal.userId !== user.id) {
      return Response.json({ success: false, error: "Signal not found" }, { status: 404 });
    }

    const updated = await db.careerSignal.update({
      where: { id },
      data: { status: "ACKNOWLEDGED" },
    });

    return Response.json({ success: true, signal: updated });
  } catch (error) {
    console.error("POST /api/signals/[id]/acknowledge error:", error);
    return Response.json(
      { success: false, error: "Failed to acknowledge signal" },
      { status: 500 }
    );
  }
}
