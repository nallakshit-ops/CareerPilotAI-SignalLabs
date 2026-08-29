import React from "react";
import Link from "next/link";
import {
  Plus,
  Briefcase,
  Users,
  Target,
  ArrowUpRight,
  Percent,
  MapPin,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRecruiterJobs } from "@/actions/job";

export const dynamic = "force-dynamic";

export default async function RecruiterJobsPage() {
  let jobs = [];
  try {
    jobs = await getRecruiterJobs();
  } catch (error) {
    console.error("Failed to load recruiter jobs:", error);
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-foreground">
            Manage Job Postings
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create, publish, and track candidate applications across your active
            openings
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="shadow-[0_0_30px_-5px_rgba(var(--primary),0.3)] hover-lift rounded-xl"
        >
          <Link href="/recruiter/jobs/new" className="flex items-center gap-2">
            <Plus className="w-5 h-5" /> Post a New Job
          </Link>
        </Button>
      </div>

      {jobs.length === 0 ? (
        <Card className="glass border-dashed border-white/[0.08] py-16 text-center shadow-xl">
          <CardContent className="flex flex-col items-center justify-center max-w-md mx-auto space-y-6">
            <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center shadow-inner">
              <Briefcase className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight">
                No Jobs Posted Yet
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                You haven't posted any job openings yet. Start publishing
                listings to receive deterministic screened candidates instantly!
              </p>
            </div>
            <Button asChild size="lg" className="rounded-xl">
              <Link href="/recruiter/jobs/new">Create First Job Posting</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job) => (
            <Card
              key={job.id}
              className="glass border-white/[0.08] hover:border-white/[0.15] transition-all duration-300 relative group overflow-hidden shadow-lg"
            >
              {/* Top Accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity" />

              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Job Metadata */}
                  <div className="space-y-4 flex-1">
                    <div>
                      <div className="flex items-center gap-3 mt-6">
                        <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-foreground group-hover:text-primary transition-colors mt-3">
                          {job.title}
                        </h2>
                        <Badge
                          variant="outline"
                          className="bg-white/[0.04] text-xs font-semibold px-2 py-0.5 capitalize border-white/[0.08] mt-3"
                        >
                          {job.employmentType}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm font-medium mt-1">
                        {job.companyName}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs font-medium text-muted-foreground pt-1">
                      <span className="flex items-center gap-1 bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/[0.05]">
                        <MapPin className="w-3.5 h-3.5 text-sky-400" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1 bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/[0.05]">
                        <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                        Min Exp: {job.minExperience}{" "}
                        {job.minExperience === 1 ? "Year" : "Years"}
                      </span>
                      <span className="flex items-center gap-1 bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/[0.05]">
                        <Calendar className="w-3.5 h-3.5 text-purple-400" />
                        Posted: {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Required Skills Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.requiredSkills.slice(0, 5).map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-white/[0.04] border-white/[0.06] text-xs px-2.5 py-0.5"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {job.requiredSkills.length > 5 && (
                        <Badge
                          variant="outline"
                          className="border-white/[0.08] text-xs bg-transparent"
                        >
                          +{job.requiredSkills.length - 5} More
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Job Analytics Metrics Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white/[0.02] border border-white/[0.05] p-4 sm:p-5 rounded-2xl shadow-inner w-full lg:w-[420px] shrink-0">
                    <div className="text-center space-y-1">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                        <Users className="w-3.5 h-3.5 text-blue-400" /> Apps
                      </div>
                      <div className="text-xl sm:text-2xl font-bold tracking-tight">
                        {job.totalApplications}
                      </div>
                    </div>

                    <div className="text-center space-y-1 border-l border-white/[0.06]">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                        <Percent className="w-3.5 h-3.5 text-emerald-400" />{" "}
                        Shortlist
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-emerald-400 tracking-tight">
                        {job.shortlistRate}%
                      </div>
                    </div>

                    <div className="text-center space-y-1 border-l border-white/[0.06]">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                        <Percent className="w-3.5 h-3.5 text-red-400" /> Reject
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-red-400 tracking-tight">
                        {job.rejectionRate}%
                      </div>
                    </div>

                    <div className="text-center space-y-1 border-l border-white/[0.06]">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                        <Target className="w-3.5 h-3.5 text-purple-400" /> Avg
                        Score
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-purple-400 tracking-tight">
                        {job.averageScore}%
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-row lg:flex-col justify-end gap-3 min-w-[140px]">
                    <Button
                      asChild
                      size="lg"
                      className="flex-1 shadow-lg hover-lift rounded-xl h-12"
                    >
                      <Link
                        href={`/recruiter/jobs/${job.id}`}
                        className="flex items-center justify-center gap-1.5 p-3"
                      >
                        View Pipeline <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
