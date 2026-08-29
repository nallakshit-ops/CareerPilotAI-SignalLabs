import React from "react";
import { getJobDetails } from "@/actions/job";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Briefcase, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import KanbanView from "./_components/kanban-view";

export const dynamic = "force-dynamic";

export default async function JobPipelinePage({ params }) {
  const { id } = await params;

  let details = null;
  try {
    details = await getJobDetails(id);
  } catch (error) {
    console.error("Failed to load job details:", error);
    redirect("/recruiter/jobs");
  }

  if (!details || !details.job) {
    redirect("/recruiter/jobs");
  }

  const { job, analytics } = details;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div className="space-y-2">
          <Button variant="ghost" asChild className="pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors group text-xs font-semibold">
            <Link href="/recruiter/jobs">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5 group-hover:-translate-x-0.5 transition-transform" /> Back to Jobs Manager
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-foreground">
              {job.title} Pipeline
            </h1>
            <span className="text-xs text-muted-foreground font-semibold bg-white/[0.04] border border-white/[0.06] px-2.5 py-0.5 rounded-lg">
              Threshold: {job.qualificationThreshold}%
            </span>
          </div>
          <p className="text-muted-foreground text-xs font-medium">
            Manage applicants, inspect match scores, view snapshots, and transition applicants across active ATS stages.
          </p>
        </div>
      </div>

      {/* Kanban Pipeline Component */}
      <KanbanView initialJob={job} initialAnalytics={analytics} />
    </div>
  );
}
