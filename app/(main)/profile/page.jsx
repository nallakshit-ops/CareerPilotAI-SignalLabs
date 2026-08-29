import React from "react";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileForm from "./_components/profile-form";

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) redirect("/onboarding");

  // This profile form is specifically tailored to Candidate profiles
  if (user.role !== "candidate") {
    redirect("/recruiter/dashboard");
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 mt-16 max-w-4xl">
      <ProfileForm initialUser={user} />
    </div>
  );
}
