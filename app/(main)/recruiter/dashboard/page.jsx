import React from "react";
import Link from "next/link";
import {
  Users,
  ThumbsUp,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  BarChart3,
  Search,
  Bookmark,
  Briefcase,
  MapPin,
  TrendingUp,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PipelineChart from "./_components/pipeline-chart";
import ScoreDistributionChart from "./_components/score-distribution-chart";
import { getRecruiterDashboardStats } from "@/actions/recruiter";

export const dynamic = "force-dynamic";

const RecruiterDashboard = async () => {
  let stats = null;
  try {
    stats = await getRecruiterDashboardStats();
  } catch (error) {
    console.error("Dashboard page failed to fetch stats:", error);
  }

  // Fallback data if no data exists
  const data = {
    totalCandidates: stats?.totalCandidates ?? 0,
    recommendedCount: stats?.recommendedCount ?? 0,
    selectedCount: stats?.selectedCount ?? 0,
    rejectedCount: stats?.rejectedCount ?? 0,
    pendingInterviews: stats?.pendingInterviews ?? 0,
    activeOpenings: stats?.activeOpenings ?? 0,
    avgMatchScore: stats?.avgMatchScore ?? 0,
    statusBreakdown: stats?.statusBreakdown ?? {},
    scoreDistribution: stats?.scoreDistribution ?? {},
    activeJobsList: stats?.activeJobsList ?? [],
  };

  const statCards = [
    {
      label: "Talent Pool",
      value: data.totalCandidates,
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
      borderColor: "border-blue-400/20",
    },
    {
      label: "Shortlisted",
      value: data.recommendedCount,
      icon: ThumbsUp,
      color: "text-teal-400",
      bgColor: "bg-teal-400/10",
      borderColor: "border-teal-400/20",
    },
    {
      label: "Hired",
      value: data.selectedCount,
      icon: CheckCircle,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
      borderColor: "border-emerald-400/20",
    },
    {
      label: "Rejected",
      value: data.rejectedCount,
      icon: XCircle,
      color: "text-red-400",
      bgColor: "bg-red-400/10",
      borderColor: "border-red-400/20",
    },
    {
      label: "Interviews",
      value: data.pendingInterviews,
      icon: Clock,
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
      borderColor: "border-amber-400/20",
    },
    {
      label: "Avg Qualification Score",
      value: `${data.avgMatchScore}%`,
      icon: Target,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
      borderColor: "border-purple-400/20",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 mb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Recruiter Dashboard
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Real-time pipeline metrics, applicant distribution, and active job postings
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/recruiter/jobs">
              <Briefcase className="w-4 h-4 mr-1.5" /> Manage Jobs
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/recruiter/jobs/new">
              <Plus className="w-4 h-4 mr-1.5" /> Post Job
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border bg-card shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                <CardTitle className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                  {stat.label}
                </CardTitle>
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-md ${stat.bgColor}`}
                >
                  <Icon className={`h-3.5 w-3.5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="border-border bg-card shadow-xs lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" /> Hiring Pipeline Funnel
            </CardTitle>
            <CardDescription className="text-xs">
              Candidate progression across screening and hiring stages
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <PipelineChart stats={data} />
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Target className="w-4 h-4 text-accent" /> Score Distribution
            </CardTitle>
            <CardDescription className="text-xs">
              Qualification score spread across candidates
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <ScoreDistributionChart stats={data} />
          </CardContent>
        </Card>
      </div>

      {/* Job Listings Grid */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" /> Active Job Postings ({data.activeJobsList.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Openings with candidates currently active in the pipeline
            </CardDescription>
          </div>
          <Button asChild size="sm" variant="ghost" className="text-xs">
            <Link href="/recruiter/jobs" className="flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {data.activeJobsList.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs font-medium">
              No active job openings posted. Start by creating a new job posting.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data.activeJobsList.slice(0, 5).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                  <div className="space-y-0.5">
                    <Link href={`/recruiter/jobs/${job.id}`} className="font-semibold text-foreground hover:underline text-xs md:text-sm">
                      {job.title}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{job.companyName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {job.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[11px] text-muted-foreground block">Candidates</span>
                      <Badge variant="secondary" className="text-xs">
                        {job.applicants} applied
                      </Badge>
                    </div>
                    <div className="text-right hidden sm:block">
                      <span className="text-[11px] text-muted-foreground block">Avg Match</span>
                      <span className="text-xs font-bold text-emerald-500">{job.avgScore}%</span>
                    </div>
                    <Button asChild size="icon" variant="ghost" className="h-8 w-8">
                      <Link href={`/recruiter/jobs/${job.id}`}>
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Search className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">
                  Find Candidates
                </CardTitle>
                <CardDescription className="text-xs">
                  Search talent pool by skills, industry domain, and experience
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/recruiter/explorer">
              <Button className="w-full h-9 font-medium" size="sm">
                <Search className="mr-2 h-4 w-4" />
                Open Candidate Explorer
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/10 text-amber-500">
                <Bookmark className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">
                  Saved Candidates
                </CardTitle>
                <CardDescription className="text-xs">
                  View bookmarked talent profiles saved for later consideration
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/recruiter/explorer?tab=saved">
              <Button variant="outline" className="w-full h-9 font-medium" size="sm">
                <Bookmark className="mr-2 h-4 w-4 text-amber-500" />
                View Bookmarks
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
