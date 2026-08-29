import React from "react";
import { getRecruiterCalls } from "@/actions/recruiter";
import TrackerView from "./_components/tracker-view";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function RecruiterTrackerPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user || user.role !== "recruiter") {
    redirect("/");
  }

  let initialCalls = [];
  try {
    initialCalls = await getRecruiterCalls();
  } catch (error) {
    console.error("Error loading calls on tracker page:", error);
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-500">
      <TrackerView initialCalls={initialCalls} />
    </div>
  );
}
