"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getCandidateCalls() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const calls = await db.interviewCall.findMany({
      where: { candidateId: user.id },
      include: {
        recruiter: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            companyName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return calls;
  } catch (error) {
    console.error("Error fetching candidate calls:", error.message);
    throw new Error("Failed to fetch interview calls");
  }
}

export async function respondToInvitation(callId, decision) {
  let actualCallId = callId;
  let actualDecision = decision;
  if (typeof callId === "object" && callId !== null) {
    actualCallId = callId.callId;
    actualDecision = callId.decision;
  }

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    // Verify the call belongs to this candidate
    const call = await db.interviewCall.findUnique({
      where: { id: actualCallId },
    });

    if (!call) throw new Error("Interview call not found");
    if (call.candidateId !== user.id) throw new Error("Unauthorized: This call does not belong to you");

    if (actualDecision !== "accepted" && actualDecision !== "declined") {
      throw new Error("Invalid decision. Must be 'accepted' or 'declined'");
    }

    const updateData = {
      candidateDecision: actualDecision,
    };

    if (actualDecision === "accepted") {
      updateData.currentStage = "Virtual Interview";
    }

    const updatedCall = await db.interviewCall.update({
      where: { id: actualCallId },
      data: updateData,
    });

    return updatedCall;
  } catch (error) {
    console.error("Error responding to invitation:", error.message);
    throw new Error("Failed to respond to interview invitation");
  }
}

export async function getInterviewCallDetails(callId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  try {
    const call = await db.interviewCall.findUnique({
      where: { id: callId },
      include: {
        recruiter: {
          select: {
            companyName: true,
          },
        },
      },
    });

    if (!call) throw new Error("Interview call not found");
    if (call.candidateId !== user.id) throw new Error("Unauthorized access to this interview call");

    return call;
  } catch (error) {
    console.error("Error getting interview call details:", error.message);
    throw new Error("Failed to get interview call details");
  }
}

export async function saveVirtualInterviewResult({
  callId,
  transcript,
  technicalScore,
  communicationScore,
  confidenceScore,
  recommendation,
  summary,
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  try {
    const call = await db.interviewCall.findUnique({
      where: { id: callId },
    });

    if (!call) throw new Error("Interview call not found");
    if (call.candidateId !== user.id) throw new Error("Unauthorized access to this interview call");

    const updatedCall = await db.interviewCall.update({
      where: { id: callId },
      data: {
        interviewTranscript: transcript,
        technicalScore,
        communicationScore,
        confidenceScore,
        interviewRecommendation: recommendation,
        interviewSummary: summary,
        status: "under_ai_review",
        currentStage: "AI Review",
      },
    });

    return updatedCall;
  } catch (error) {
    console.error("Error saving virtual interview result:", error.message);
    throw new Error("Failed to save virtual interview result");
  }
}

