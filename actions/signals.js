"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { runSignalEngine, getUserSignalsWithSummary } from "@/lib/signals/signal-engine";

/**
 * Gets currently stored signals and summary for the authenticated user
 */
export async function getCandidateSignals() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    return await getUserSignalsWithSummary(user.id);
  } catch (error) {
    console.error("Error getting user signals:", error);
    throw new Error("Failed to fetch career signals");
  }
}

/**
 * Runs full signal detection scan and updates the database
 */
export async function refreshCandidateSignals(forceRefresh = false) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const result = await runSignalEngine(user.id, { forceRefresh });
    revalidatePath("/dashboard");
    revalidatePath("/intelligence");
    return { success: true, ...result };
  } catch (error) {
    console.error("Error refreshing candidate signals:", error);
    throw new Error(error.message || "Failed to scan career signals");
  }
}

/**
 * Acknowledges a signal
 */
export async function acknowledgeSignal(signalId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const signal = await db.careerSignal.findUnique({
      where: { id: signalId },
    });

    if (!signal || signal.userId !== user.id) {
      throw new Error("Signal not found or unauthorized");
    }

    const updated = await db.careerSignal.update({
      where: { id: signalId },
      data: { status: "ACKNOWLEDGED" },
    });

    revalidatePath("/dashboard");
    revalidatePath("/intelligence");
    return { success: true, signal: updated };
  } catch (error) {
    console.error("Error acknowledging signal:", error);
    throw new Error("Failed to acknowledge signal");
  }
}

/**
 * Resolves a signal manually or upon goal completion
 */
export async function resolveSignal(signalId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const signal = await db.careerSignal.findUnique({
      where: { id: signalId },
    });

    if (!signal || signal.userId !== user.id) {
      throw new Error("Signal not found or unauthorized");
    }

    const updated = await db.careerSignal.update({
      where: { id: signalId },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date(),
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/intelligence");
    return { success: true, signal: updated };
  } catch (error) {
    console.error("Error resolving signal:", error);
    throw new Error("Failed to resolve signal");
  }
}

/**
 * Updates a career action status (e.g. PENDING -> COMPLETED)
 */
export async function toggleActionStatus(actionId, newStatus) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
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
      throw new Error("Action not found or unauthorized");
    }

    const updated = await db.careerAction.update({
      where: { id: actionId },
      data: {
        status: newStatus,
        completedAt: newStatus === "COMPLETED" ? new Date() : null,
      },
    });

    // Check if all actions in this signal are completed, and if so, auto-resolve signal!
    const remainingIncomplete = action.signal.actions.filter(
      (a) => a.id !== actionId && a.status !== "COMPLETED"
    );

    if (newStatus === "COMPLETED" && remainingIncomplete.length === 0) {
      await db.careerSignal.update({
        where: { id: action.signalId },
        data: {
          status: "RESOLVED",
          resolvedAt: new Date(),
        },
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/intelligence");
    return { success: true, action: updated };
  } catch (error) {
    console.error("Error toggling action status:", error);
    throw new Error("Failed to update action status");
  }
}
