import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function PATCH(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { actionId } = await params;
    const body = await req.json();
    const { status } = body;

    if (!["PENDING", "IN_PROGRESS", "COMPLETED", "DISMISSED"].includes(status)) {
      return Response.json(
        { success: false, error: "Invalid action status" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return Response.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const action = await db.careerAction.findUnique({
      where: { id: actionId },
      include: {
        signal: {
          include: {
            actions: true,
          },
        },
      },
    });

    if (!action || action.userId !== user.id) {
      return Response.json({ success: false, error: "Action not found" }, { status: 404 });
    }

    const updated = await db.careerAction.update({
      where: { id: actionId },
      data: {
        status,
        completedAt: status === "COMPLETED" ? new Date() : null,
      },
    });

    // Check auto-resolution of signal if all actions are completed
    const remainingIncomplete = action.signal.actions.filter(
      (a) => a.id !== actionId && a.status !== "COMPLETED"
    );

    if (status === "COMPLETED" && remainingIncomplete.length === 0) {
      await db.careerSignal.update({
        where: { id: action.signalId },
        data: {
          status: "RESOLVED",
          resolvedAt: new Date(),
        },
      });
    }

    return Response.json({ success: true, action: updated });
  } catch (error) {
    console.error("PATCH /api/signals/actions/[actionId] error:", error);
    return Response.json(
      { success: false, error: "Failed to update action status" },
      { status: 500 }
    );
  }
}
